import { Request, Response } from 'express';
import { purchaseVehicle, restockVehicle } from './inventory.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

/** Typed error with optional code property */
type CodedError = Error & { code?: string };

// ─── Purchase ─────────────────────────────────────────────────────────────────

/**
 * POST /api/vehicles/:id/purchase
 * Decrements quantity by 1. Requires authentication.
 */
export const purchase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vehicle = await purchaseVehicle(id);
    sendSuccess(res, { vehicle }, 200, 'Vehicle purchased successfully.');
  } catch (error) {
    const coded = error as CodedError;
    if (coded.code === 'NOT_FOUND') {
      sendError(res, coded.message, 404);
      return;
    }
    if (coded.code === 'OUT_OF_STOCK') {
      sendError(res, coded.message, 400);
      return;
    }
    console.error('[purchase error]', error);
    sendError(res, 'An unexpected error occurred. Please try again.', 500);
  }
};

// ─── Restock ──────────────────────────────────────────────────────────────────

/**
 * POST /api/vehicles/:id/restock
 * Increments quantity by the specified amount. Requires ADMIN role.
 */
export const restock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body as { quantity: number };
    const vehicle = await restockVehicle(id, quantity);
    sendSuccess(res, { vehicle }, 200, 'Vehicle restocked successfully.');
  } catch (error) {
    const coded = error as CodedError;
    if (coded.code === 'NOT_FOUND') {
      sendError(res, coded.message, 404);
      return;
    }
    console.error('[restock error]', error);
    sendError(res, 'An unexpected error occurred. Please try again.', 500);
  }
};
