import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApplicationError } from '@shared/errors/ApplicationError.js';
import { Cause } from '@shared/errors/Cause.js';
import { Registry } from '@infrastructure/config/Registry.js';

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
    },
  };
});

describe('Users Use Cases', () => {
  const mockUserRepository = vi.mocked(Registry.UserRepository);
  const mockUserProvider = vi.mocked(Registry.UserProvider);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('importUser', () => {
    it('should throw conflict error when user already imported', async () => {
      mockUserRepository.findByExternalId.mockResolvedValue({
        id: 1,
        externalId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatar: 'avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { importUser } = await import('@application/use-cases/users/import.js');

      await expect(importUser(1)).rejects.toThrow(
        new ApplicationError('User already imported', Cause.CONFLICT)
      );

      expect(mockUserRepository.findByExternalId).toHaveBeenCalledWith(1);
      expect(mockUserProvider.fetchById).not.toHaveBeenCalled();
    });

    it('should throw not found error when external user does not exist', async () => {
      mockUserRepository.findByExternalId.mockResolvedValue(null);
      mockUserProvider.fetchById.mockResolvedValue(null);

      const { importUser } = await import('@application/use-cases/users/import.js');

      await expect(importUser(999)).rejects.toThrow(
        new ApplicationError('User not found in external service', Cause.NOT_FOUND)
      );

      expect(mockUserRepository.findByExternalId).toHaveBeenCalledWith(999);
      expect(mockUserProvider.fetchById).toHaveBeenCalledWith(999);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should import user when not exists locally and found externally', async () => {
      const externalUser = {
        id: 1,
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        avatar: 'avatar.jpg',
      };

      const savedUser = {
        id: 1,
        externalId: 1,
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        avatar: 'avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByExternalId.mockResolvedValue(null);
      mockUserProvider.fetchById.mockResolvedValue(externalUser);
      mockUserRepository.save.mockResolvedValue(savedUser);

      const { importUser } = await import('@application/use-cases/users/import.js');

      const result = await importUser(1);

      expect(result).toEqual(savedUser);
      expect(mockUserRepository.findByExternalId).toHaveBeenCalledWith(1);
      expect(mockUserProvider.fetchById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        externalId: 1,
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        avatar: 'avatar.jpg',
      });
    });
  });

  describe('getSavedUsers', () => {
    it('should return all saved users', async () => {
      const mockUsers = [
        {
          id: 1,
          externalId: 1,
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          avatar: 'avatar1.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          externalId: 2,
          email: 'user2@example.com',
          firstName: 'User',
          lastName: 'Two',
          avatar: 'avatar2.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const { getSavedUsers } = await import('@application/use-cases/users/getSavedUsers.js');

      const result = await getSavedUsers();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no users saved', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const { getSavedUsers } = await import('@application/use-cases/users/getSavedUsers.js');

      const result = await getSavedUsers();

      expect(result).toEqual([]);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getSavedUser', () => {
    it('should return saved user when found', async () => {
      const mockUser = {
        id: 1,
        externalId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatar: 'avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const { getSavedUser } = await import('@application/use-cases/users/getSavedUser.js');

      const result = await getSavedUser(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw not found error when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const { getSavedUser } = await import('@application/use-cases/users/getSavedUser.js');

      await expect(getSavedUser(999)).rejects.toThrow(
        new ApplicationError('User not found', Cause.NOT_FOUND)
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('deleteSavedUser', () => {
    it('should delete saved user when found', async () => {
      const mockUser = {
        id: 1,
        externalId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatar: 'avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      const { deleteSavedUser } = await import('@application/use-cases/users/deleteSavedUser.js');

      await deleteSavedUser(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw not found error when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const { deleteSavedUser } = await import('@application/use-cases/users/deleteSavedUser.js');

      await expect(deleteSavedUser(999)).rejects.toThrow(
        new ApplicationError('User not found', Cause.NOT_FOUND)
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });
});
