import { Router, type Request, type Response } from 'express';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { users } from '../lib/mongodb.js';
import { hashPassword, verifyPassword, signAccessToken, verifyAccessToken } from '../lib/auth.js';

export const authRouter = Router();

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/** POST /api/v1/auth/register — create a user in MongoDB with a hashed password. */
authRouter.post('/register', async (req: Request, res: Response) => {
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }
  const email = parsed.data.email.toLowerCase();
  const passwordHash = await hashPassword(parsed.data.password);

  try {
    const result = await users().insertOne({ email, passwordHash, createdAt: new Date() });
    return res.status(201).json({
      user: { id: result.insertedId.toString(), email },
      needsEmailConfirmation: false,
    });
  } catch (err) {
    // Duplicate key on the unique email index → already registered.
    if (err && typeof err === 'object' && (err as { code?: number }).code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    throw err;
  }
});

/** POST /api/v1/auth/login — verify credentials and issue a signed JWT access token. */
authRouter.post('/login', async (req: Request, res: Response) => {
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const email = parsed.data.email.toLowerCase();

  const user = await users().findOne({ email });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const id = user._id!.toString();
  const { token, expiresAt } = signAccessToken(id, user.email);

  return res.status(200).json({
    access_token: token,
    expires_at: expiresAt,
    user: { id, email: user.email },
  });
});

/** GET /api/v1/auth/me — verify the bearer token and return the user. */
authRouter.get('/me', async (req: Request, res: Response) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const claims = verifyAccessToken(token);
  if (!claims) return res.status(401).json({ error: 'Unauthorized' });

  // Confirm the user still exists (token could outlive a deleted account).
  let user;
  try {
    user = await users().findOne({ _id: new ObjectId(claims.sub) });
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  return res.status(200).json({ user: { id: user._id!.toString(), email: user.email } });
});
