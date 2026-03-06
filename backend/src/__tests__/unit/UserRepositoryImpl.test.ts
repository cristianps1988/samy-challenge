import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepositoryImpl } from '@infrastructure/persistence/repositories/UserRepositoryImpl.js';


const createMockKnex = () => {
  const queryBuilder: any = {
    where: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(null),
    insert: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    del: vi.fn().mockResolvedValue(1),
  };

  const mockKnex: any = vi.fn(() => queryBuilder);
  mockKnex.table = vi.fn(() => queryBuilder);

  return { queryBuilder, mockKnex };
};

describe('UserRepositoryImpl', () => {
  let repository: UserRepositoryImpl;
  let queryBuilder: any;
  let mockKnex: any;

  beforeEach(() => {
    const setup = createMockKnex();
    queryBuilder = setup.queryBuilder;
    mockKnex = setup.mockKnex;
    repository = new UserRepositoryImpl(mockKnex);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users ordered by created_at desc', async () => {
      const mockUsers = [
        {
          id: 2,
          external_id: 2,
          email: 'user2@example.com',
          first_name: 'User',
          last_name: 'Two',
          avatar: 'avatar2.jpg',
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
        },
        {
          id: 1,
          external_id: 1,
          email: 'user1@example.com',
          first_name: 'User',
          last_name: 'One',
          avatar: 'avatar1.jpg',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ];

      queryBuilder.select.mockReturnThis();
      queryBuilder.orderBy.mockResolvedValue(mockUsers);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2);
      expect(result[1].id).toBe(1);
      expect(result[0]).toEqual({
        id: 2,
        externalId: 2,
        email: 'user2@example.com',
        firstName: 'User',
        lastName: 'Two',
        avatar: 'avatar2.jpg',
        createdAt: mockUsers[0].created_at,
        updatedAt: mockUsers[0].updated_at,
      });
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 1,
        external_id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        avatar: 'avatar.jpg',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      queryBuilder.first.mockResolvedValue(mockUser);

      const result = await repository.findById(1);

      expect(result).toEqual({
        id: 1,
        externalId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatar: 'avatar.jpg',
        createdAt: mockUser.created_at,
        updatedAt: mockUser.updated_at,
      });

      expect(mockKnex).toHaveBeenCalledWith('users');
      expect(queryBuilder.where).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return null when not found', async () => {
      queryBuilder.first.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByExternalId', () => {
    it('should return user when found by external id', async () => {
      const mockUser = {
        id: 1,
        external_id: 42,
        email: 'external@example.com',
        first_name: 'External',
        last_name: 'User',
        avatar: 'avatar.jpg',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      queryBuilder.first.mockResolvedValue(mockUser);

      const result = await repository.findByExternalId(42);

      expect(result).toEqual({
        id: 1,
        externalId: 42,
        email: 'external@example.com',
        firstName: 'External',
        lastName: 'User',
        avatar: 'avatar.jpg',
        createdAt: mockUser.created_at,
        updatedAt: mockUser.updated_at,
      });

      expect(queryBuilder.where).toHaveBeenCalledWith({ external_id: 42 });
    });

    it('should return null when not found by external id', async () => {
      queryBuilder.first.mockResolvedValue(null);

      const result = await repository.findByExternalId(999);

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should create new user and return it', async () => {
      const mockUser = {
        id: 1,
        external_id: 1,
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
        avatar: 'avatar.jpg',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      queryBuilder.insert.mockReturnThis();
      queryBuilder.returning.mockResolvedValue([mockUser]);

      const result = await repository.save({
        externalId: 1,
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        avatar: 'avatar.jpg',
      });

      expect(result).toEqual({
        id: 1,
        externalId: 1,
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        avatar: 'avatar.jpg',
        createdAt: mockUser.created_at,
        updatedAt: mockUser.updated_at,
      });

      expect(queryBuilder.insert).toHaveBeenCalledWith({
        external_id: 1,
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
        avatar: 'avatar.jpg',
      });
    });
  });

  describe('delete', () => {
    it('should delete user by id', async () => {
      await repository.delete(1);

      expect(mockKnex).toHaveBeenCalledWith('users');
      expect(queryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(queryBuilder.del).toHaveBeenCalled();
    });
  });
});
