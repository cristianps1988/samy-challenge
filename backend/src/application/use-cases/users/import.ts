import { Registry } from '@infrastructure/config/Registry.js';
import { ApplicationError } from '@shared/errors/ApplicationError.js';
import { Cause } from '@shared/errors/Cause.js';
import { User } from '@core/entities/user.entity.js';

async function importUser(externalId: number): Promise<User> {
  const existingUser = await Registry.UserRepository.findByExternalId(externalId);

  if (existingUser) {
    throw new ApplicationError('User already imported', Cause.CONFLICT);
  }

  const externalUser = await Registry.UserProvider.fetchById(externalId);

  if (!externalUser) {
    throw new ApplicationError('User not found in external service', Cause.NOT_FOUND);
  }

  const user = await Registry.UserRepository.save({
    externalId: externalUser.id,
    email: externalUser.email,
    firstName: externalUser.firstName,
    lastName: externalUser.lastName,
    avatar: externalUser.avatar,
  });

  return user;
}

export { importUser };
