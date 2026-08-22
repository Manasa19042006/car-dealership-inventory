import { Request, Response } from 'express';
import { registerUser } from './auth.service';
import { RegisterRequestBody } from '../types/auth.types';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * POST /api/auth/register
 * Handles user registration requests.
 * Validation is handled by the validateRegister middleware before this runs.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as RegisterRequestBody;

    const user = await registerUser(body);

    sendSuccess(res, { user }, 201, 'User registered successfully.');
  } catch (error) {
    // Handle known business logic errors
    if ((error as Error & { code?: string }).code === 'EMAIL_IN_USE') {
      sendError(res, (error as Error).message, 409);
      return;
    }

    // Unknown/unexpected errors
    console.error('[register controller error]', error);
    sendError(res, 'An unexpected error occurred. Please try again.', 500);
  }
};
