import { Request, Response, NextFunction } from 'express';

function requestId(): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.headers['x-request-id'] || crypto.randomUUID();
    req.headers['x-request-id'] = id as string;
    res.setHeader('x-request-id', id);
    next();
  };
}

export { requestId };
