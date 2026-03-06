import { Registry } from '@infrastructure/config/Registry.js';
import { ApplicationError } from '@shared/errors/ApplicationError.js';
import { Cause } from '@shared/errors/Cause.js';
import { User } from '@core/entities/user.entity.js';

async function getSavedUser(id: number): Promise<User> {
  const user = await Registry.UserRepository.findById(id);

  if (!user) {
    throw new ApplicationError('User not found', Cause.NOT_FOUND);
  }

  return user;
}

export { getSavedUser };
