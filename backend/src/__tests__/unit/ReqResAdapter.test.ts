import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReqResAdapter } from '@infrastructure/adapters/reqres/ReqResAdapter.js';

const mockFetch = global.fetch as ReturnType<typeof vi.fn>;

describe('ReqResAdapter', () => {
  let adapter: ReqResAdapter;

  beforeEach(() => {
    adapter = new ReqResAdapter();
    mockFetch.mockClear();
  });

  describe('fetchById', () => {
    it('should return external user when found', async () => {
      const mockUser = {
        data: {
          id: 1,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          avatar: 'https://example.com/avatar.jpg',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const result = await adapter.fetchById(1);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatar: 'https://example.com/avatar.jpg',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should return null when user not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await adapter.fetchById(999);

      expect(result).toBeNull();
    });

    it('should throw error when fetch fails with non-404 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(adapter.fetchById(1)).rejects.toThrow('Failed to fetch user');
    });

    it('should return null when response data is empty', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null }),
      } as Response);

      const result = await adapter.fetchById(1);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return token on successful login', async () => {
      const mockResponse = {
        token: 'test-token-123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await adapter.login('eve.holt@reqres.in', 'cityslicka');

      expect(result).toEqual({ token: 'test-token-123' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'eve.holt@reqres.in', password: 'cityslicka' }),
        })
      );
    });

    it('should throw error on failed login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      } as Response);

      await expect(adapter.login('invalid@email.com', 'wrong')).rejects.toThrow('Login failed');
    });
  });
});
