import { Registry } from '@infrastructure/config/Registry.js';
import { User } from '@core/entities/user.entity.js';

async function getSavedUsers(): Promise<User[]> {
  return await Registry.UserRepository.findAll();
}

export { getSavedUsers };
