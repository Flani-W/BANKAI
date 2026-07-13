import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './lib/config.js';
import { connectMongo } from './lib/mongodb.js';
import { authRouter } from './routes/auth.js';

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// CORS allow-list (never '*'). Requests from unknown origins are rejected.
app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin / curl (no Origin header) and listed origins only
      if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
  }),
);

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', mongodb: Boolean(config.mongoUri) });
});

// Rate-limit the auth surface: 20 requests / 15 min / IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});

app.use('/api/v1/auth', authLimiter, authRouter);

// Fail-closed generic error handler (no internals leaked).
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error && /CORS/.test(err.message) ? 'Origin not allowed' : 'Server error';
  res.status(500).json({ error: message });
});

// Connect to MongoDB before accepting traffic, then start listening.
connectMongo()
  .then(() => {
    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`[bankai-backend] listening on http://localhost:${config.port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[bankai-backend] failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
