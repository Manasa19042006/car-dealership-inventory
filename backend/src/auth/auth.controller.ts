import { Request, Response } from 'express';
import { registerUser, loginUser } from './auth.service';
import { RegisterRequestBody, LoginRequestBody } from '../types/auth.types';
import { sendSuccess, sendError } from '../utils/apiResponse';

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Validation handled by validateRegister middleware before this runs.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as RegisterRequestBody;
    const user = await registerUser(body);
    sendSuccess(res, { user }, 201, 'User registered successfully.');
  } catch (error) {
    if ((error as Error & { code?: string }).code === 'EMAIL_IN_USE') {
      sendError(res, (error as Error).message, 409);
      return;
    }
    console.error('[register controller error]', error);
    sendError(res, 'An unexpected error occurred. Please try again.', 500);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Validation handled by validateLogin middleware before this runs.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as LoginRequestBody;
    const result = await loginUser(body);
    sendSuccess(res, { user: result.user, token: result.token }, 200, 'Login successful.');
  } catch (error) {
    if ((error as Error & { code?: string }).code === 'INVALID_CREDENTIALS') {
      sendError(res, (error as Error).message, 401);
      return;
    }
    console.error('[login controller error]', error);
    sendError(res, 'An unexpected error occurred. Please try again.', 500);
  }
};
