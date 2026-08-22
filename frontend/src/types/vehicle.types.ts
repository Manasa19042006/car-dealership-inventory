export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: string | number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehiclePayload {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UpdateVehiclePayload {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export interface VehicleSearchParams {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  total: number;
}

// ─── Cart types ───────────────────────────────────────────────────────────────

export interface CartItem {
  vehicle: Vehicle;
  /** Discount percentage applied at time of adding to cart (0–100) */
  discountPct: number;
  /** Original price at time of adding */
  originalPrice: number;
  /** Discounted price */
  finalPrice: number;
}
