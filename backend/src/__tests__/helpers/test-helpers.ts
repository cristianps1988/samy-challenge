import { Express } from 'express';
import { createAuthRoutes } from '@infrastructure/http/routes/auth.routes.js';
import { createUsersRoutes } from '@infrastructure/http/routes/users.routes.js';
import express from 'express';

export function createTestApp(): Express {
  const app = express();

  app.use(express.json());

  const apiRouter = express.Router();
  apiRouter.use('/auth', createAuthRoutes());
  apiRouter.use('/users', createUsersRoutes());

  app.use('/api', apiRouter);

  return app;
}

export function createAuthHeader(email: string): { Authorization: string } {
  return {
    Authorization: `Bearer test-token-${email}`,
  };
}
