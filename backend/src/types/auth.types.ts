/**
 * Shared TypeScript types for authentication.
 * These types are used across controllers, services, and validators.
 */

/** Shape of the registration request body */
export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

/** Safe user object returned in API responses — password is always excluded */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
