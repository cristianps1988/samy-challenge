import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { ApiResponse } from '@shared/utils/ApiResponse.js';
import { env } from './config/env.js';
import { logger } from './logger.js';
import { createAuthRoutes } from './http/routes/auth.routes.js';
import { createUsersRoutes } from './http/routes/users.routes.js';
import { createPostsRoutes } from './http/routes/posts.routes.js';
import { errorHandler } from './http/middleware/error-handler.middleware.js';
import { requestId } from './http/middleware/request-id.middleware.js';
import { requestLogger } from './http/middleware/request-logger.middleware.js';
import { auth } from './http/middleware/auth.middleware.js';
import { publicRateLimit, authRateLimit, protectedRateLimit } from './http/middleware/rate-limit.middleware.js';
import { spec } from './http/docs/openapi.js';

const app: Express = express();

app.use(helmet());
app.use(requestId());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));

const publicRouter = express.Router();
const protectedRouter = express.Router();

publicRouter.use('/auth', authRateLimit, createAuthRoutes());
protectedRouter.use('/users', createUsersRoutes());
protectedRouter.use('/posts', createPostsRoutes());

const apiRouter = express.Router();
apiRouter.use(publicRateLimit);
apiRouter.use(publicRouter);
apiRouter.use(auth(), protectedRateLimit, protectedRouter);

app.use('/api', apiRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json(ApiResponse.error('Route not found'));
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    error: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined,
    url: req.url,
    method: req.method,
    requestId: req.headers['x-request-id'],
  });

  errorHandler(err, req, res, next);
});

export { app, logger };
