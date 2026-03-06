import { Cause } from './Cause.js';

export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly cause: Cause
  ) {
    super(message);
    this.name = 'ApplicationError';
    Error.captureStackTrace(this, this.constructor);
  }
}
