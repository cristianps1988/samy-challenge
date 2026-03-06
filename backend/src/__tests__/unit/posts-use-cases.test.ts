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
        findById: vi.fn(),
      },
      PostRepository: {
        create: vi.fn(),
      },
    },
  };
});

describe('Posts Use Cases', () => {
  const mockUserRepository = vi.mocked(Registry.UserRepository);
  const mockPostRepository = vi.mocked(Registry.PostRepository);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a post when the author exists', async () => {
      const mockAuthor = {
        id: 1,
        externalId: 1,
        email: 'author@example.com',
        firstName: 'Author',
        lastName: 'User',
        avatar: 'avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'This is a test post content',
        authorId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue(mockAuthor);
      mockPostRepository.create.mockResolvedValue(mockPost);

      const { createPost } = await import('@application/use-cases/posts/create.js');

      const result = await createPost({ title: 'Test Post', content: 'This is a test post content', authorId: 1 });

      expect(result).toEqual(mockPost);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockPostRepository.create).toHaveBeenCalledWith({
        title: 'Test Post',
        content: 'This is a test post content',
        authorId: 1,
      });
    });

    it('should throw not found error when author does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const { createPost } = await import('@application/use-cases/posts/create.js');

      await expect(
        createPost({ title: 'Test Post', content: 'This is a test post content', authorId: 999 })
      ).rejects.toThrow(new ApplicationError('Author not found', Cause.NOT_FOUND));

      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
      expect(mockPostRepository.create).not.toHaveBeenCalled();
    });
  });
});
