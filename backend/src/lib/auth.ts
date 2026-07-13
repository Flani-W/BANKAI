import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

/**
 * Password hashing + JWT issuance. These two jobs were previously handled by Supabase
 * Auth; with MongoDB we do them ourselves.
 */

const BCRYPT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface AccessToken {
  token: string;
  /** Unix seconds at which the token expires (mirrors Supabase's `expires_at`). */
  expiresAt: number;
}

interface TokenClaims {
  sub: string; // user id
  email: string;
}

/** Sign a short-lived access token for an authenticated user. */
export function signAccessToken(userId: string, email: string): AccessToken {
  const token = jwt.sign({ sub: userId, email } satisfies TokenClaims, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
  const decoded = jwt.decode(token) as { exp: number };
  return { token, expiresAt: decoded.exp };
}

/** Verify a bearer token. Returns the claims, or null if invalid/expired. */
export function verifyAccessToken(token: string): TokenClaims | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenClaims;
    return { sub: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}
