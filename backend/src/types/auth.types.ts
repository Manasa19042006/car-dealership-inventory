/**
 * Shared TypeScript types for authentication.
 * Used across controllers, services, validators, and middleware.
 */

/** Shape of the registration request body */
export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

/** Shape of the login request body */
export interface LoginRequestBody {
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

/** JWT payload structure stored inside the token */
export interface JwtPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

/** Extends Express Request to carry the authenticated user after middleware */
export interface AuthenticatedUser {
  userId: string;
  role: string;
}
