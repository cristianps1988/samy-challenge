import { Registry } from '@infrastructure/config/Registry.js';
import { ApplicationError } from '@shared/errors/ApplicationError.js';
import { Cause } from '@shared/errors/Cause.js';
import { Post } from '@core/entities/post.entity.js';

async function updatePost(id: number, data: Partial<{ title: string; content: string }>): Promise<Post> {
  const existingPost = await Registry.PostRepository.findById(id);

  if (!existingPost) {
    throw new ApplicationError('Post not found', Cause.NOT_FOUND);
  }

  return await Registry.PostRepository.update(id, data);
}

export { updatePost };
