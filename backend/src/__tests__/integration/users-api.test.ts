import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createUsersRoutes } from '@infrastructure/http/routes/users.routes.js';
import { errorHandler } from '@infrastructure/http/middleware/error-handler.middleware.js';
import { auth } from '@infrastructure/http/middleware/auth.middleware.js';
import { ApiResponse } from '@shared/utils/ApiResponse.js';
import { TokenService, TokenPayload } from '@application/ports/providers/token.service.port.js';

vi.mock('@infrastructure/config/Registry.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@infrastructure/config/Registry.js')>();
  return {
    ...actual,
    Registry: {
      UserRepository: {
        findByExternalId: vi.fn(),
        findById: vi.fn(),
        save: vi.fn(),
        delete: vi.fn(),
        findAll: vi.fn(),
      },
      UserProvider: {
        fetchById: vi.fn(),
      },
      TokenService: {
        generateToken: vi.fn().mockReturnValue('test-jwt-token'),
        verifyToken: vi.fn().mockReturnValue({ email: 'test@example.com' }),
      },
    },
  };
});

class MockTokenService implements TokenService {
  generateToken(payload: TokenPayload): string {
    return `mock-token-${payload.email}`;
  }

  verifyToken(_token: string): TokenPayload {
    return { email: 'test@example.com' };
  }
}

const mockUserRepository = vi.mocked(
  (await import('@infrastructure/config/Registry.js')).Registry.UserRepository
);
const mockUserProvider = vi.mocked(
  (await import('@infrastructure/config/Registry.js')).Registry.UserProvider
);

function wrapAuthMiddleware(tokenService: TokenService) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      auth(tokenService)(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function createTestApp(): express.Express {
  const app = express();
  app.use(express.json());

  const usersRouter = express.Router();
  usersRouter.use(wrapAuthMiddleware(new MockTokenService()));

  const routes = createUsersRoutes();
  usersRouter.use((req, res, next) => {
    routes(req, res, next);
  });

  app.use('/api/users', usersRouter);

  app.use((_req, res) => {
    res.status(404).json(ApiResponse.error('Route not found'));
  });

  app.use(errorHandler);

  return app;
}

describe('Users API Integration Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  beforeAll(() => {
    vi.setConfig({ testTimeout: 10000 });
  });

  describe('POST /api/users/import/:id', () => {
    it('should import a new user successfully', async () => {
      const externalUser = {
        id: 1,
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        avatar: 'https://example.com/avatar.jpg',
      };

      const savedUser = {
        id: 1,
        externalId: 1,
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      };

      mockUserRepository.findByExternalId.mockResolvedValue(null);
      mockUserProvider.fetchById.mockResolvedValue(externalUser);
      mockUserRepository.save.mockResolvedValue(savedUser);

      const response = await request(app)
        .post('/api/users/import/1')
        .set('Authorization', 'Bearer mock-token-test@example.com')
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: 1,
          externalId: 1,
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
          avatar: 'https://example.com/avatar.jpg',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });
    });

    it('should return 409 when user already imported', async () => {
      const existingUser = {
        id: 1,
        externalId: 1,
        email: 'existing@example.com',
        firstName: 'Existing',
        lastName: 'User',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByExternalId.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/api/users/import/1')
        .set('Authorization', 'Bearer mock-token-test@example.com')
        .expect(409);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'User already imported',
        },
      });
    });

    it('should return 404 when external user not found', async () => {
      mockUserRepository.findByExternalId.mockResolvedValue(null);
      mockUserProvider.fetchById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/users/import/999')
        .set('Authorization', 'Bearer mock-token-test@example.com')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'User not found in external service',
        },
      });
    });

    it('should return 401 without auth header', async () => {
      const response = await request(app)
        .post('/api/users/import/1')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Missing or invalid authorization header',
        },
      });
    });
  });

  describe('GET /api/users/saved', () => {
    it('should return all saved users', async () => {
      const mockUsers = [
        {
          id: 1,
          externalId: 1,
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          avatar: 'https://example.com/avatar1.jpg',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        },
        {
          id: 2,
          externalId: 2,
          email: 'user2@example.com',
          firstName: 'User',
          lastName: 'Two',
          avatar: 'https://example.com/avatar2.jpg',
          createdAt: new Date('2024-01-02T00:00:00.000Z'),
          updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        },
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/api/users/saved')
        .set('Authorization', 'Bearer mock-token-test@example.com')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [
          {
            id: 1,
            externalId: 1,
            email: 'user1@example.com',
            firstName: 'User',
            lastName: 'One',
            avatar: 'https://example.com/avatar1.jpg',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            externalId: 2,
            email: 'user2@example.com',
            firstName: 'User',
            lastName: 'Two',
            avatar: 'https://example.com/avatar2.jpg',
            createdAt: '2024-01-02T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
          },
        ],
      });
    });

    it('should return empty array when no users saved', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/users/saved')
        .set('Authorization', 'Bearer mock-token-test@example.com')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should return 401 without auth header', async () => {
      const response = await request(app)
        .get('/api/users/saved')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Missing or invalid authorization header',
        },
      });
    });
  });

  describe('GET /api/users/saved/:id', () => {
    it('should return saved user when found', async () => {
      const mockUser = {
        id: 1,
        externalId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/saved/1')
        .set('Authorization', 'Bearer mock-token-test@example.com')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: 1,
          externalId: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          avatar: 'https://example.com/avatar.jpg',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });
    });

    it('should return 404 when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/saved/999')
        .set('Authorization', 'Bearer mock-token-test@example.com')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'User not found',
        },
      });
    });

    it('should return 401 without auth header', async () => {
      const response = await request(app)
        .get('/api/users/saved/1')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Missing or invalid authorization header',
        },
      });
    });
  });

  describe('DELETE /api/users/saved/:id', () => {
    it('should delete saved user successfully', async () => {
      const mockUser = {
        id: 1,
        externalId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/users/saved/1')
        .set('Authorization', 'Bearer mock-token-test@example.com')
        .expect(204);
    });

    it('should return 404 when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/users/saved/999')
        .set('Authorization', 'Bearer mock-token-test@example.com')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'User not found',
        },
      });
    });

    it('should return 401 without auth header', async () => {
      const response = await request(app)
        .delete('/api/users/saved/1')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Missing or invalid authorization header',
        },
      });
    });
  });
});
