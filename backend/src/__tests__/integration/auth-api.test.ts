import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createAuthRoutes } from '@infrastructure/http/routes/auth.routes.js';
import { errorHandler } from '@infrastructure/http/middleware/error-handler.middleware.js';
import { ApiResponse } from '@shared/utils/ApiResponse.js';
import { Registry } from '@infrastructure/config/Registry.js';

vi.mock('@infrastructure/config/Registry.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@infrastructure/config/Registry.js')>();
  return {
    ...actual,
    Registry: {
      UserProvider: {
        login: vi.fn(),
      },
      TokenService: {
        generateToken: vi.fn(),
      },
    },
  };
});

const mockUserProvider = vi.mocked(Registry.UserProvider);
const mockTokenService = vi.mocked(Registry.TokenService);

function createTestApp(): express.Express {
  const app = express();
  app.use(express.json());

  const apiRouter = express.Router();
  apiRouter.use('/auth', createAuthRoutes());
  app.use('/api', apiRouter);

  app.use((_req, res) => {
    res.status(404).json(ApiResponse.error('Route not found'));
  });

  app.use(errorHandler);

  return app;
}

describe('Auth API Integration Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return a token on successful login', async () => {
      mockUserProvider.login.mockResolvedValue({ token: 'reqres-token' });
      mockTokenService.generateToken.mockReturnValue('signed-jwt-token');

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'eve.holt@reqres.in', password: 'cityslicka' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { token: 'signed-jwt-token' },
      });

      expect(mockUserProvider.login).toHaveBeenCalledWith('eve.holt@reqres.in', 'cityslicka');
      expect(mockTokenService.generateToken).toHaveBeenCalledWith({ email: 'eve.holt@reqres.in' });
    });

    it('should return 401 when credentials are invalid', async () => {
      mockUserProvider.login.mockRejectedValue(new Error('Unauthorized'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'badpassword' })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Invalid credentials',
        },
      });
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'cityslicka' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(mockUserProvider.login).not.toHaveBeenCalled();
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'eve.holt@reqres.in' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(mockUserProvider.login).not.toHaveBeenCalled();
    });

    it('should return 400 when email format is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'cityslicka' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(mockUserProvider.login).not.toHaveBeenCalled();
    });
  });
});
