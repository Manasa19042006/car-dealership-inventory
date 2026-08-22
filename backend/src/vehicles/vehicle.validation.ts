import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { CreateVehicleBody, UpdateVehicleBody, VehicleSearchQuery } from '../types/vehicle.types';

// ─── Create Validation ────────────────────────────────────────────────────────

/**
 * Validates POST /api/vehicles request body.
 * All fields are required for creation.
 */
export const validateCreateVehicle = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { make, model, category, price, quantity } = req.body as Partial<CreateVehicleBody>;

  if (!make || typeof make !== 'string' || make.trim().length === 0) {
    sendError(res, 'Make is required and must not be empty.', 400);
    return;
  }

  if (!model || typeof model !== 'string' || model.trim().length === 0) {
    sendError(res, 'Model is required and must not be empty.', 400);
    return;
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    sendError(res, 'Category is required and must not be empty.', 400);
    return;
  }

  if (price === undefined || price === null) {
    sendError(res, 'Price is required.', 400);
    return;
  }

  const priceNum = Number(price);
  if (isNaN(priceNum) || priceNum <= 0) {
    sendError(res, 'Price must be a positive number greater than zero.', 400);
    return;
  }

  if (quantity === undefined || quantity === null) {
    sendError(res, 'Quantity is required.', 400);
    return;
  }

  const quantityNum = Number(quantity);
  if (isNaN(quantityNum) || !Number.isInteger(quantityNum) || quantityNum < 0) {
    sendError(res, 'Quantity must be a non-negative integer.', 400);
    return;
  }

  next();
};

// ─── Update Validation ────────────────────────────────────────────────────────

/**
 * Validates PUT /api/vehicles/:id request body.
 * All fields are optional — only validates what is present.
 */
export const validateUpdateVehicle = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { make, model, category, price, quantity } = req.body as UpdateVehicleBody;

  if (make !== undefined) {
    if (typeof make !== 'string' || make.trim().length === 0) {
      sendError(res, 'Make must not be empty.', 400);
      return;
    }
  }

  if (model !== undefined) {
    if (typeof model !== 'string' || model.trim().length === 0) {
      sendError(res, 'Model must not be empty.', 400);
      return;
    }
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim().length === 0) {
      sendError(res, 'Category must not be empty.', 400);
      return;
    }
  }

  if (price !== undefined) {
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      sendError(res, 'Price must be a positive number greater than zero.', 400);
      return;
    }
  }

  if (quantity !== undefined) {
    const quantityNum = Number(quantity);
    if (isNaN(quantityNum) || !Number.isInteger(quantityNum) || quantityNum < 0) {
      sendError(res, 'Quantity must be a non-negative integer.', 400);
      return;
    }
  }

  next();
};

// ─── Search Validation ────────────────────────────────────────────────────────

/**
 * Validates GET /api/vehicles/search query parameters.
 */
export const validateSearchVehicles = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { minPrice, maxPrice } = req.query as VehicleSearchQuery;

  if (minPrice !== undefined) {
    const val = Number(minPrice);
    if (isNaN(val) || val < 0) {
      sendError(res, 'minPrice must be a non-negative number.', 400);
      return;
    }
  }

  if (maxPrice !== undefined) {
    const val = Number(maxPrice);
    if (isNaN(val) || val < 0) {
      sendError(res, 'maxPrice must be a non-negative number.', 400);
      return;
    }
  }

  next();
};
