import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '@shared/errors/ValidationError.js';

export function validate(schema: {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        const body = schema.body.parse(req.body);
        req.body = body;
      }

      if (schema.params) {
        const params = schema.params.parse(req.params);
        Object.defineProperty(req, 'params', { value: params, writable: true, configurable: true });
      }

      if (schema.query) {
        const query = schema.query.parse(req.query);
        Object.defineProperty(req, 'query', { value: query, writable: true, configurable: true });
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new ValidationError('Validation failed', details);
      }

      next(error);
    }
  };
}
