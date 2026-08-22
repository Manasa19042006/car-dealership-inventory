/**
 * Centralised API client — all backend requests go through here.
 * Automatically attaches Authorization header when token exists.
 * Dispatches 'auth:logout' event on 401 so AuthContext can react.
 */
const BASE_URL = '/api';

const getToken = (): string | null => localStorage.getItem('token');

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  requiresAuth?: boolean;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, requiresAuth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    throw new ApiError(response.status, data.message ?? 'An error occurred.');
  }

  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

import type { RegisterPayload, LoginPayload, User } from '../types/auth.types';

interface AuthApiResponse {
  status: string;
  message: string;
  data: { user: User; token?: string };
}

export const authApi = {
  register: (payload: RegisterPayload): Promise<AuthApiResponse> =>
    request<AuthApiResponse>('/auth/register', { method: 'POST', body: payload }),

  login: (payload: LoginPayload): Promise<AuthApiResponse> =>
    request<AuthApiResponse>('/auth/login', { method: 'POST', body: payload }),
};

// ─── Vehicles ─────────────────────────────────────────────────────────────────

import type {
  Vehicle,
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleSearchParams,
  VehicleListResponse,
} from '../types/vehicle.types';

interface VehicleApiResponse {
  status: string;
  message: string;
  data: { vehicle: Vehicle };
}

interface VehicleListApiResponse {
  status: string;
  message: string;
  data: VehicleListResponse;
}

export const vehicleApi = {
  list: (): Promise<VehicleListApiResponse> =>
    request<VehicleListApiResponse>('/vehicles', { requiresAuth: true }),

  search: (params: VehicleSearchParams): Promise<VehicleListApiResponse> => {
    const query = new URLSearchParams();
    if (params.make) query.set('make', params.make);
    if (params.model) query.set('model', params.model);
    if (params.category) query.set('category', params.category);
    if (params.minPrice) query.set('minPrice', params.minPrice);
    if (params.maxPrice) query.set('maxPrice', params.maxPrice);
    const qs = query.toString();
    return request<VehicleListApiResponse>(`/vehicles/search${qs ? `?${qs}` : ''}`, {
      requiresAuth: true,
    });
  },

  create: (payload: CreateVehiclePayload): Promise<VehicleApiResponse> =>
    request<VehicleApiResponse>('/vehicles', {
      method: 'POST',
      body: payload,
      requiresAuth: true,
    }),

  update: (id: string, payload: UpdateVehiclePayload): Promise<VehicleApiResponse> =>
    request<VehicleApiResponse>(`/vehicles/${id}`, {
      method: 'PUT',
      body: payload,
      requiresAuth: true,
    }),

  delete: (id: string): Promise<{ status: string; message: string }> =>
    request<{ status: string; message: string }>(`/vehicles/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),

  purchase: (id: string): Promise<VehicleApiResponse> =>
    request<VehicleApiResponse>(`/vehicles/${id}/purchase`, {
      method: 'POST',
      requiresAuth: true,
    }),

  restock: (id: string, quantity: number): Promise<VehicleApiResponse> =>
    request<VehicleApiResponse>(`/vehicles/${id}/restock`, {
      method: 'POST',
      body: { quantity },
      requiresAuth: true,
    }),
};
