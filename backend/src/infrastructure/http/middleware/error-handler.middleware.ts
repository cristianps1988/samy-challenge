import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/HttpError.js';
import { AppError } from '@shared/errors/index.js';
import { ApiResponse } from '@shared/utils/ApiResponse.js';
import { ValidationError } from '@shared/errors/ValidationError.js';
import { env } from '../../config/env.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json(ApiResponse.error(err.message));
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      ApiResponse.error(
        err.message,
        err instanceof ValidationError ? err.details : undefined
      )
    );
    return;
  }

  if (err && typeof err === 'object' && 'errors' in err) {
    res.status(400).json(
      ApiResponse.error('Validation failed', (err as { errors: unknown[] }).errors)
    );
    return;
  }

  const message = env.NODE_ENV === 'development' && err instanceof Error
    ? err.message
    : 'Internal server error';

  res.status(500).json(ApiResponse.error(message));
}
