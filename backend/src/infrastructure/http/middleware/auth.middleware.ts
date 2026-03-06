import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError.js';
import { TokenService } from '@application/ports/providers/token.service.port.js';
import { Registry } from '../../config/Registry.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
      };
    }
  }
}

export function auth(tokenService?: TokenService) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    try {
      const service = tokenService || Registry.TokenService;
      const payload = service.verifyToken(token);
      req.user = {
        email: payload.email,
      };
      next();
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  };
}
