import prisma from '../config/database';
import {
  CreateVehicleBody,
  UpdateVehicleBody,
  VehicleSearchQuery,
  VehicleResponse,
} from '../types/vehicle.types';

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Creates a new vehicle in the database.
 */
export const createVehicle = async (
  data: CreateVehicleBody,
): Promise<VehicleResponse> => {
  const vehicle = await prisma.vehicle.create({
    data: {
      make: data.make.trim(),
      model: data.model.trim(),
      category: data.category.trim(),
      price: data.price,
      quantity: data.quantity,
    },
  });
  return vehicle as unknown as VehicleResponse;
};

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * Returns all vehicles in the inventory.
 */
export const getAllVehicles = async (): Promise<{
  vehicles: VehicleResponse[];
  total: number;
}> => {
  const [vehicles, total] = await prisma.$transaction([
    prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.vehicle.count(),
  ]);
  return { vehicles: vehicles as unknown as VehicleResponse[], total };
};

// ─── Search ───────────────────────────────────────────────────────────────────

/**
 * Searches vehicles with optional filters.
 * Filters are case-insensitive using Prisma's `mode: 'insensitive'`.
 */
export const searchVehicles = async (
  query: VehicleSearchQuery,
): Promise<{ vehicles: VehicleResponse[]; total: number }> => {
  const where: Parameters<typeof prisma.vehicle.findMany>[0]['where'] = {};

  if (query.make) {
    where.make = { contains: query.make, mode: 'insensitive' };
  }

  if (query.model) {
    where.model = { contains: query.model, mode: 'insensitive' };
  }

  if (query.category) {
    where.category = { contains: query.category, mode: 'insensitive' };
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {};
    if (query.minPrice !== undefined) {
      where.price.gte = Number(query.minPrice);
    }
    if (query.maxPrice !== undefined) {
      where.price.lte = Number(query.maxPrice);
    }
  }

  const [vehicles, total] = await prisma.$transaction([
    prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } }),
    prisma.vehicle.count({ where }),
  ]);

  return { vehicles: vehicles as unknown as VehicleResponse[], total };
};

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Updates a vehicle by ID.
 * Only provided fields are updated (partial update).
 *
 * @throws {Error} with code 'NOT_FOUND' if vehicle doesn't exist.
 */
export const updateVehicle = async (
  id: string,
  data: UpdateVehicleBody,
): Promise<VehicleResponse> => {
  const existing = await prisma.vehicle.findUnique({ where: { id } });

  if (!existing) {
    const error = new Error(`Vehicle with id '${id}' not found.`);
    (error as Error & { code: string }).code = 'NOT_FOUND';
    throw error;
  }

  const updateData: UpdateVehicleBody = {};

  if (data.make !== undefined) updateData.make = data.make.trim();
  if (data.model !== undefined) updateData.model = data.model.trim();
  if (data.category !== undefined) updateData.category = data.category.trim();
  if (data.price !== undefined) updateData.price = data.price;
  if (data.quantity !== undefined) updateData.quantity = data.quantity;

  const updated = await prisma.vehicle.update({
    where: { id },
    data: updateData,
  });

  return updated as unknown as VehicleResponse;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Deletes a vehicle by ID (Admin only — enforced at route level).
 *
 * @throws {Error} with code 'NOT_FOUND' if vehicle doesn't exist.
 */
export const deleteVehicle = async (id: string): Promise<void> => {
  const existing = await prisma.vehicle.findUnique({ where: { id } });

  if (!existing) {
    const error = new Error(`Vehicle with id '${id}' not found.`);
    (error as Error & { code: string }).code = 'NOT_FOUND';
    throw error;
  }

  await prisma.vehicle.delete({ where: { id } });
};
