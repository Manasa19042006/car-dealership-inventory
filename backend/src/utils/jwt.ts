import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';

/**
 * Returns the JWT secret from environment variables.
 * Throws if the secret is not configured — this is intentional to fail fast
 * rather than silently use an empty/weak secret.
 */
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }
  return secret;
};

/**
 * Signs a JWT token with the user's ID and role.
 * Expiry is read from JWT_EXPIRES_IN env var, defaulting to '7d'.
 */
export const signToken = (userId: string, role: string): string => {
  const payload: JwtPayload = { userId, role };
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'];

  return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

/**
 * Verifies a JWT token and returns the decoded payload.
 * Throws a JsonWebTokenError or TokenExpiredError if invalid.
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
};
