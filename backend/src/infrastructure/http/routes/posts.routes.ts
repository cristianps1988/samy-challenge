import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import {
  CreatePostDTO,
  UpdatePostDTO,
  ListPostsQueryDTO,
  PostIdParamsDTO,
} from '../dto/posts.dto.js';
import {
  createPostController,
  listPostsController,
  getPostController,
  updatePostController,
  deletePostController,
} from '../controllers/posts.js';
import { handleAndCatch } from '../handlers/handleAndCatch.js';

function createPostsRoutes(): Router {
  const router = Router();

  router.post(
    '/',
    validate({ body: CreatePostDTO }),
    handleAndCatch(createPostController)
  );

  router.get(
    '/',
    validate({ query: ListPostsQueryDTO }),
    handleAndCatch(listPostsController)
  );

  router.get(
    '/:id',
    validate({ params: PostIdParamsDTO }),
    handleAndCatch(getPostController)
  );

  router.put(
    '/:id',
    validate({ params: PostIdParamsDTO, body: UpdatePostDTO }),
    handleAndCatch(updatePostController)
  );

  router.delete(
    '/:id',
    validate({ params: PostIdParamsDTO }),
    handleAndCatch(deletePostController)
  );

  return router;
}

export { createPostsRoutes };

