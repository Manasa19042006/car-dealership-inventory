import { Response } from 'express';

/**
 * Standardised API response helpers.
 * All endpoints use these to keep response shape consistent.
 */

export const sendSuccess = (
  res: Response,
  data: unknown,
  statusCode = 200,
  message = 'Success',
): void => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
): void => {
  res.status(statusCode).json({
    status: 'error',
    message,
  });
};
