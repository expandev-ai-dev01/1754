/**
 * @summary
 * Generic validation middleware using Zod.
 * Creates a middleware function that validates req.body, req.params, or req.query
 * against a provided Zod schema.
 *
 * @module middleware/validation
 */
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { errorResponse } from '@/utils/response';

export const validate =
  (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({ path: e.path.join('.'), message: e.message }));
        return res
          .status(400)
          .json(errorResponse('ValidationError', 'Invalid request data.', details));
      }
      return res
        .status(500)
        .json(errorResponse('InternalServerError', 'An unexpected validation error occurred.'));
    }
  };
