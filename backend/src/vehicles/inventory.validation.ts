import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

/**
 * Validates POST /api/vehicles/:id/restock request body.
 * quantity must be a positive integer (>0).
 * Purchase has no body validation — it always decrements by 1.
 */
export const validateRestock = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { quantity } = req.body as { quantity?: unknown };

  if (quantity === undefined || quantity === null) {
    sendError(res, 'Quantity is required.', 400);
    return;
  }

  const qty = Number(quantity);

  if (isNaN(qty)) {
    sendError(res, 'Quantity must be a number.', 400);
    return;
  }

  if (!Number.isInteger(qty)) {
    sendError(res, 'Quantity must be a whole number.', 400);
    return;
  }

  if (qty <= 0) {
    sendError(res, 'Restock quantity must be greater than zero.', 400);
    return;
  }

  next();
};
