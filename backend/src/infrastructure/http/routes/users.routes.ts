import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { ImportUserParamsDTO, UserIdParamsDTO } from '../dto/users.dto.js';
import {
  importUserController,
  fetchExternalUsersController,
  fetchExternalUserController,
  getSavedUsersController,
  getSavedUserController,
  deleteSavedUserController,
} from '../controllers/users.js';
import { handleAndCatch } from '../handlers/handleAndCatch.js';

function createUsersRoutes(): Router {
  const router = Router();

  router.get('/', handleAndCatch(fetchExternalUsersController));

  router.get(
    '/external/:id',
    validate({ params: ImportUserParamsDTO }),
    handleAndCatch(fetchExternalUserController)
  );

  router.post(
    '/import/:id',
    validate({ params: ImportUserParamsDTO }),
    handleAndCatch(importUserController)
  );

  router.get('/saved', handleAndCatch(getSavedUsersController));

  router.get(
    '/saved/:id',
    validate({ params: UserIdParamsDTO }),
    handleAndCatch(getSavedUserController)
  );

  router.delete(
    '/saved/:id',
    validate({ params: UserIdParamsDTO }),
    handleAndCatch(deleteSavedUserController)
  );

  return router;
}

export { createUsersRoutes };

