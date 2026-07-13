import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(`Missing required env var: ${name} (see backend/.env.example)`);
  }
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 8787),

  // MongoDB connection. The URI carries credentials, so it lives only in backend secrets.
  mongoUri: required('MONGODB_URI'),
  mongoDb: process.env.MONGODB_DB ?? 'bankai',

  // JWT signing. JWT_SECRET replaces what Supabase Auth used to do for us: it signs the
  // access tokens we hand to the frontend and verifies them on /me. Keep it long + secret.
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',

  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};
