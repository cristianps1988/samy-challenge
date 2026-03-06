import { z } from 'zod';

export const CreatePostDTO = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be at most 255 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000, 'Content must be at most 10000 characters'),
  authorId: z.coerce.number().int().positive('Author ID must be a positive integer'),
});

export type CreatePostDTOType = z.infer<typeof CreatePostDTO>;

export const UpdatePostDTO = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be at most 255 characters').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000, 'Content must be at most 10000 characters').optional(),
});

export type UpdatePostDTOType = z.infer<typeof UpdatePostDTO>;

export const ListPostsQueryDTO = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type ListPostsQueryDTOType = z.infer<typeof ListPostsQueryDTO>;

export const PostIdParamsDTO = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
});

export type PostIdParamsDTOType = z.infer<typeof PostIdParamsDTO>;
