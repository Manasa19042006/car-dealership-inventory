/**
 * TypeScript types for Vehicle management.
 */

/** Shape of the create vehicle request body */
export interface CreateVehicleBody {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

/** Shape of the update vehicle request body — all fields optional */
export interface UpdateVehicleBody {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

/** Search/filter query parameters */
export interface VehicleSearchQuery {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

/** Vehicle object returned in API responses */
export interface VehicleResponse {
  id: string;
  make: string;
  model: string;
  category: string;
  price: unknown;   // Prisma Decimal serialises as string in JSON
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}
