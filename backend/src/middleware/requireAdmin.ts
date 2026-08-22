import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

/**
 * Authorization Middleware — restricts a route to ADMIN users only.
 *
 * Must be used AFTER the `authenticate` middleware, which populates req.user.
 * Returns HTTP 403 Forbidden if the authenticated user is not an ADMIN.
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    sendError(res, 'Forbidden. Admin access required.', 403);
    return;
  }
  next();
};
