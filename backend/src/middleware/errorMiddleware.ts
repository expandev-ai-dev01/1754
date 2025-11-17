/**
 * @summary
 * Centralized error handling middleware.
 * Catches errors from route handlers and formats a consistent error response.
 *
 * @module middleware/error
 */
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '@/utils/response';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  console.error('An unexpected error occurred:', err.stack);

  // In a real application, you would check for specific error types
  // and set the status code accordingly.
  const statusCode = 500;
  const message = 'InternalServerError';

  res.status(statusCode).json(errorResponse(message, err.message));
};
