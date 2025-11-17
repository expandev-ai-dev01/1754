/**
 * @summary
 * Middleware to handle requests for routes that do not exist (404).
 *
 * @module middleware/notFound
 */
import { Request, Response } from 'express';
import { errorResponse } from '@/utils/response';

export const notFoundMiddleware = (req: Request, res: Response) => {
  res
    .status(404)
    .json(errorResponse('NotFound', `The requested route '${req.originalUrl}' does not exist.`));
};
