import { Request, Response } from 'express';
import {
  createVehicle,
  getAllVehicles,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
} from './vehicle.service';
import { CreateVehicleBody, UpdateVehicleBody, VehicleSearchQuery } from '../types/vehicle.types';
import { sendSuccess, sendError } from '../utils/apiResponse';

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * POST /api/vehicles
 * Creates a new vehicle. Requires authentication.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as CreateVehicleBody;
    const vehicle = await createVehicle(body);
    sendSuccess(res, { vehicle }, 201, 'Vehicle created successfully.');
  } catch (error) {
    console.error('[create vehicle error]', error);
    sendError(res, 'An unexpected error occurred. Please try again.', 500);
  }
};

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/vehicles
 * Returns all vehicles. Requires authentication.
 */
export const list = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { vehicles, total } = await getAllVehicles();
    sendSuccess(res, { vehicles, total }, 200, 'Vehicles retrieved successfully.');
  } catch (error) {
    console.error('[list vehicles error]', error);
    sendError(res, 'An unexpected error occurred. Please try again.', 500);
  }
};

// ─── Search ───────────────────────────────────────────────────────────────────

/**
 * GET /api/vehicles/search
 * Searches vehicles with optional query parameters.
 * Requires authentication.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as VehicleSearchQuery;
    const { vehicles, total } = await searchVehicles(query);
    sendSuccess(res, { vehicles, total }, 200, 'Search completed successfully.');
  } catch (error) {
    console.error('[search vehicles error]', error);
    sendError(res, 'An unexpected error occurred. Please try again.', 500);
  }
};

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * PUT /api/vehicles/:id
 * Updates a vehicle by ID. Requires authentication.
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as UpdateVehicleBody;
    const vehicle = await updateVehicle(id, body);
    sendSuccess(res, { vehicle }, 200, 'Vehicle updated successfully.');
  } catch (error) {
    if ((error as Error & { code?: string }).code === 'NOT_FOUND') {
      sendError(res, (error as Error).message, 404);
      return;
    }
    console.error('[update vehicle error]', error);
    sendError(res, 'An unexpected error occurred. Please try again.', 500);
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * DELETE /api/vehicles/:id
 * Deletes a vehicle by ID. Requires ADMIN role.
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteVehicle(id);
    sendSuccess(res, null, 200, 'Vehicle deleted successfully.');
  } catch (error) {
    if ((error as Error & { code?: string }).code === 'NOT_FOUND') {
      sendError(res, (error as Error).message, 404);
      return;
    }
    console.error('[delete vehicle error]', error);
    sendError(res, 'An unexpected error occurred. Please try again.', 500);
  }
};
