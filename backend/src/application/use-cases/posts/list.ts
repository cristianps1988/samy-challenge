import { Registry } from '@infrastructure/config/Registry.js';
import { PostWithAuthor } from '@core/entities/post.entity.js';

export interface ListPostsResult {
  posts: PostWithAuthor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function listPosts(page: number, limit: number): Promise<ListPostsResult> {
  const [posts, total] = await Promise.all([
    Registry.PostRepository.findAll({ page, limit }),
    Registry.PostRepository.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return { posts, total, page, limit, totalPages };
}

export { listPosts };
