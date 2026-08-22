import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

/**
 * Password rules:
 *  - Minimum 8 characters
 *  - At least one uppercase letter
 *  - At least one lowercase letter
 *  - At least one digit
 */
const PASSWORD_RULES = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasDigit: /[0-9]/,
};

/** Basic RFC-5322–inspired email regex */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Middleware: validates the POST /api/auth/register request body.
 * Returns HTTP 400 with a descriptive message on any validation failure.
 * Calls next() only when all fields are valid.
 */
export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  // ── Name ────────────────────────────────────────────────────────────────
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    sendError(res, 'Name is required and must not be empty.', 400);
    return;
  }

  // ── Email ────────────────────────────────────────────────────────────────
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    sendError(res, 'Email is required.', 400);
    return;
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    sendError(res, 'Email must be a valid email address.', 400);
    return;
  }

  // ── Password ─────────────────────────────────────────────────────────────
  if (!password || typeof password !== 'string' || password.length === 0) {
    sendError(res, 'Password is required.', 400);
    return;
  }

  if (password.length < PASSWORD_RULES.minLength) {
    sendError(
      res,
      `Password must be at least ${PASSWORD_RULES.minLength} characters long.`,
      400,
    );
    return;
  }

  if (!PASSWORD_RULES.hasUppercase.test(password)) {
    sendError(res, 'Password must contain at least one uppercase letter.', 400);
    return;
  }

  if (!PASSWORD_RULES.hasLowercase.test(password)) {
    sendError(res, 'Password must contain at least one lowercase letter.', 400);
    return;
  }

  if (!PASSWORD_RULES.hasDigit.test(password)) {
    sendError(res, 'Password must contain at least one number.', 400);
    return;
  }

  next();
};
