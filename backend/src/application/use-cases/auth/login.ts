import { Registry } from '@infrastructure/config/Registry.js';
import { ApplicationError } from '@shared/errors/ApplicationError.js';
import { Cause } from '@shared/errors/Cause.js';

async function login(email: string, password: string): Promise<{ token: string }> {
  if (!email || !password) {
    throw new ApplicationError('Email and password are required', Cause.UNAUTHORIZED);
  }

  try {
    await Registry.UserProvider.login(email, password);
    const token = Registry.TokenService.generateToken({ email });
    return { token };
  } catch {
    throw new ApplicationError('Invalid credentials', Cause.UNAUTHORIZED);
  }
}

export { login };
