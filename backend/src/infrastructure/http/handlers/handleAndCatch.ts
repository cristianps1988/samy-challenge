import { Request, Response, NextFunction } from 'express';
import { ApplicationError } from '@shared/errors/ApplicationError.js';
import { mapCauseToHttpError } from '../errors/HttpError.js';

type ControllerFunction = (req: Request, res: Response) => Promise<void>;

export function handleAndCatch(controller: ControllerFunction) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await controller(req, res);
    } catch (error) {
      if (error instanceof ApplicationError) {
        next(mapCauseToHttpError(error.cause, error.message));
      } else {
        next(error);
      }
    }
  };
}
