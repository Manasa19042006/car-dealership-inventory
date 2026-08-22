import { AuthenticatedUser } from './auth.types';

/**
 * Augments the Express Request interface globally so that
 * req.user is available on authenticated routes without casting.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
