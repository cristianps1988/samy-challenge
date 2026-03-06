import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  public readonly details?: unknown;

  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 400);
    this.name = 'ValidationError';
    this.details = details;
  }
}
