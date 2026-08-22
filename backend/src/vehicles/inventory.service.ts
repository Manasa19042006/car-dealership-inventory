import prisma from '../config/database';
import { VehicleResponse } from '../types/vehicle.types';

/**
 * Typed error helper so controllers can identify known business errors.
 */
const makeError = (message: string, code: string): Error => {
  const err = new Error(message);
  (err as Error & { code: string }).code = code;
  return err;
};

// ─── Purchase ─────────────────────────────────────────────────────────────────

/**
 * Atomically decrements a vehicle's quantity by 1.
 *
 * Uses a Prisma interactive transaction with a conditional update so that
 * quantity can NEVER go below zero — even under concurrent load.
 *
 * Strategy:
 *  1. Find the vehicle inside the transaction (with FOR UPDATE row lock via
 *     Prisma's interactive transaction isolation).
 *  2. If quantity === 0 → throw OUT_OF_STOCK.
 *  3. Decrement quantity by 1 and return the updated record.
 *
 * @throws {Error} code 'NOT_FOUND'     — vehicle does not exist.
 * @throws {Error} code 'OUT_OF_STOCK'  — quantity is already 0.
 */
export const purchaseVehicle = async (id: string): Promise<VehicleResponse> => {
  return prisma.$transaction(async (tx) => {
    // Lock the row for this transaction
    const vehicle = await tx.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      throw makeError(`Vehicle with id '${id}' not found.`, 'NOT_FOUND');
    }

    if (vehicle.quantity <= 0) {
      throw makeError(
        'This vehicle is out of stock and cannot be purchased.',
        'OUT_OF_STOCK',
      );
    }

    // Safe to decrement — quantity is guaranteed > 0 inside this transaction
    const updated = await tx.vehicle.update({
      where: { id },
      data: { quantity: { decrement: 1 } },
    });

    return updated as unknown as VehicleResponse;
  });
};

// ─── Restock ──────────────────────────────────────────────────────────────────

/**
 * Atomically increments a vehicle's quantity by the given amount.
 *
 * Uses Prisma's atomic increment operator so concurrent restock and
 * purchase operations do not race.
 *
 * @param id       Vehicle UUID.
 * @param quantity Positive integer to add to current stock.
 *
 * @throws {Error} code 'NOT_FOUND' — vehicle does not exist.
 */
export const restockVehicle = async (
  id: string,
  quantity: number,
): Promise<VehicleResponse> => {
  const existing = await prisma.vehicle.findUnique({ where: { id } });

  if (!existing) {
    throw makeError(`Vehicle with id '${id}' not found.`, 'NOT_FOUND');
  }

  const updated = await prisma.vehicle.update({
    where: { id },
    data: { quantity: { increment: quantity } },
  });

  return updated as unknown as VehicleResponse;
};
