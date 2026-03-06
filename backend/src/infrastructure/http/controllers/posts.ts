import { Request, Response } from 'express';
import { createPost, listPosts, getPost, updatePost, deletePost } from '@application/use-cases/posts/index.js';
import { ApiResponse } from '@shared/utils/ApiResponse.js';
import { ResponseAdapter } from '../handlers/ResponseAdapter.js';

async function createPostController(req: Request, res: Response): Promise<void> {
  const post = await createPost(req.body);
  res.status(201).json(ApiResponse.success(ResponseAdapter.adapt(post)));
}

async function listPostsController(req: Request, res: Response): Promise<void> {
  const { page, limit } = req.query;

  const result = await listPosts(
    Number(page),
    Number(limit)
  );

  res.json(
    ApiResponse.success(
      ResponseAdapter.adapt(result.posts),
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }
    )
  );
}

async function getPostController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const post = await getPost(Number(id));
  res.json(ApiResponse.success(ResponseAdapter.adapt(post)));
}

async function updatePostController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const post = await updatePost(Number(id), req.body);
  res.json(ApiResponse.success(ResponseAdapter.adapt(post)));
}

async function deletePostController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await deletePost(Number(id));
  res.status(204).send();
}

export {
  createPostController,
  listPostsController,
  getPostController,
  updatePostController,
  deletePostController,
};
