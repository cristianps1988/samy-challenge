import { Cause } from '@shared/errors/Cause.js';

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'HttpError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}

export class UnauthorizedHttpError extends HttpError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedHttpError';
  }
}

export class NotFoundHttpError extends HttpError {
  constructor(message: string = 'Not found') {
    super(message, 404);
    this.name = 'NotFoundHttpError';
  }
}

export class ForbiddenHttpError extends HttpError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenHttpError';
  }
}

export class ConflictHttpError extends HttpError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
    this.name = 'ConflictHttpError';
  }
}

export class BadRequestHttpError extends HttpError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
    this.name = 'BadRequestHttpError';
  }
}

function mapCauseToHttpError(cause: Cause, message: string): HttpError {
  switch (cause) {
    case Cause.CONFLICT:
      return new ConflictHttpError(message);
    case Cause.UNAUTHORIZED:
      return new UnauthorizedHttpError(message);
    case Cause.NOT_FOUND:
      return new NotFoundHttpError(message);
    case Cause.FORBIDDEN:
      return new ForbiddenHttpError(message);
    case Cause.BAD_REQUEST:
      return new BadRequestHttpError(message);
    case Cause.INTERNAL:
    default:
      return new InternalServerError(message);
  }
}

export { mapCauseToHttpError };
