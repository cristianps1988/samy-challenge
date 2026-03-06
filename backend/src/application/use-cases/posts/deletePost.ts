import { Registry } from '@infrastructure/config/Registry.js';
import { ApplicationError } from '@shared/errors/ApplicationError.js';
import { Cause } from '@shared/errors/Cause.js';

async function deletePost(id: number): Promise<void> {
  const existingPost = await Registry.PostRepository.findById(id);

  if (!existingPost) {
    throw new ApplicationError('Post not found', Cause.NOT_FOUND);
  }

  await Registry.PostRepository.delete(id);
}

export { deletePost };
