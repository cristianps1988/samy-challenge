import { Router } from 'express';
import { loginController } from '../controllers/auth.js';
import { validate } from '../middleware/validate.middleware.js';
import { LoginDTO } from '../dto/auth.dto.js';
import { handleAndCatch } from '../handlers/handleAndCatch.js';

function createAuthRoutes(): Router {
  const router = Router();
  router.post('/login', validate({ body: LoginDTO }), handleAndCatch(loginController));
  return router;
}

export { createAuthRoutes };

