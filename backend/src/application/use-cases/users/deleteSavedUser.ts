import { Registry } from '@infrastructure/config/Registry.js';
import { ApplicationError } from '@shared/errors/ApplicationError.js';
import { Cause } from '@shared/errors/Cause.js';

async function deleteSavedUser(id: number): Promise<void> {
  const user = await Registry.UserRepository.findById(id);

  if (!user) {
    throw new ApplicationError('User not found', Cause.NOT_FOUND);
  }

  await Registry.UserRepository.delete(id);
}

export { deleteSavedUser };
