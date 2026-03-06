import { Registry } from '@infrastructure/config/Registry.js';

async function fetchExternalUsers(page: number = 1) {
  return await Registry.UserProvider.fetchUsers(page);
}

export { fetchExternalUsers };
