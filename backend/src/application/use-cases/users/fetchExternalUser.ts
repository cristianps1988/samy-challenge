import { Registry } from '@infrastructure/config/Registry.js';
import { ApplicationError } from '@shared/errors/ApplicationError.js';
import { Cause } from '@shared/errors/Cause.js';
import { ExternalUser } from '@application/ports/providers/external-user.provider.port.js';

async function fetchExternalUser(id: number): Promise<ExternalUser> {
  const user = await Registry.UserProvider.fetchById(id);

  if (!user) {
    throw new ApplicationError('User not found', Cause.NOT_FOUND);
  }

  return user;
}

export { fetchExternalUser };
