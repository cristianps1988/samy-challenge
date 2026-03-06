import { Registry } from '@infrastructure/config/Registry.js';
import { ApplicationError } from '@shared/errors/ApplicationError.js';
import { Cause } from '@shared/errors/Cause.js';
import { Post } from '@core/entities/post.entity.js';

async function createPost(data: { title: string; content: string; authorId: number }): Promise<Post> {
  const author = await Registry.UserRepository.findById(data.authorId);

  if (!author) {
    throw new ApplicationError('Author not found', Cause.NOT_FOUND);
  }

  return await Registry.PostRepository.create(data);
}

export { createPost };
