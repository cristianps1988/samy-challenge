import { Registry } from '@infrastructure/config/Registry.js';
import { ApplicationError } from '@shared/errors/ApplicationError.js';
import { Cause } from '@shared/errors/Cause.js';
import { PostWithAuthor } from '@core/entities/post.entity.js';

async function getPost(id: number): Promise<PostWithAuthor> {
  const post = await Registry.PostRepository.findById(id);

  if (!post) {
    throw new ApplicationError('Post not found', Cause.NOT_FOUND);
  }

  return post;
}

export { getPost };
