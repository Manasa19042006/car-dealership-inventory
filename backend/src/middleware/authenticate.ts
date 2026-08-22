import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/apiResponse';

/**
 * Authentication Middleware — protects routes that require a valid JWT.
 *
 * Expected header format:
 *   Authorization: Bearer <token>
 *
 * On success:  populates req.user = { userId, role } and calls next().
 * On failure:  responds with HTTP 401 and does NOT call next().
 *
 * Security notes:
 *  - Generic error messages are used to avoid leaking information.
 *  - Token is verified using the JWT_SECRET from environment variables.
 *  - Expired tokens are rejected with the same 401 as invalid tokens.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  // ── 1. Check header exists and starts with "Bearer " ─────────────────────
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required. Please log in.', 401);
    return;
  }

  // ── 2. Extract the token ──────────────────────────────────────────────────
  const token = authHeader.slice(7).trim(); // remove "Bearer "

  if (!token) {
    sendError(res, 'Authentication required. Please log in.', 401);
    return;
  }

  // ── 3. Verify the token ───────────────────────────────────────────────────
  try {
    const decoded = verifyToken(token);

    // Attach the authenticated user to the request for downstream handlers
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch {
    // JsonWebTokenError (invalid) or TokenExpiredError (expired) — both are 401
    sendError(res, 'Authentication required. Please log in.', 401);
  }
};
