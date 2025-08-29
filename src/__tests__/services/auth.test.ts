import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authApi } from '@/services/auth';
import { fetcher } from '@/services/fetcher';
import type { LoginForm } from '@/shared/schemas/auth';
import type { LoginResponse } from '@/types/auth';

// Mock the fetcher
vi.mock('@/services/fetcher', () => ({
  fetcher: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call fetcher with correct parameters for login', async () => {
      const mockCredentials: LoginForm = {
        username: 'testuser',
        password: 'password123',
      };

      const mockResponse: LoginResponse = {
        success: true,
        token: 'mock-token',
        user: {
          id: 1,
          name: 'Test User',
          username: 'testuser',
          avatar: 'avatar.jpg',
          roles: ['user'],
          permissions: ['user:view'],
        },
      };

      vi.mocked(fetcher).mockResolvedValue(mockResponse);

      const result = await authApi.login(mockCredentials);

      expect(fetcher).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(mockCredentials),
        skipAuth: true,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle login failure', async () => {
      const mockCredentials: LoginForm = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const mockError = new Error('Invalid credentials');
      vi.mocked(fetcher).mockRejectedValue(mockError);

      await expect(authApi.login(mockCredentials)).rejects.toThrow('Invalid credentials');

      expect(fetcher).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(mockCredentials),
        skipAuth: true,
      });
    });

    it('should handle network errors during login', async () => {
      const mockCredentials: LoginForm = {
        username: 'testuser',
        password: 'password123',
      };

      const networkError = new Error('Network error');
      vi.mocked(fetcher).mockRejectedValue(networkError);

      await expect(authApi.login(mockCredentials)).rejects.toThrow('Network error');
    });
  });

  describe('logout', () => {
    it('should complete successfully', async () => {
      await authApi.logout();
      // Logout no longer handles localStorage - this is now done in Redux slice
    });

    it('should complete successfully even if localStorage is not available', async () => {
      await authApi.logout();
      // Logout no longer handles localStorage directly
    });
  });

  describe('getProfile', () => {
    it('should call fetcher with correct endpoint', async () => {
      const mockProfile = {
        id: 1,
        name: 'Test User',
        username: 'testuser',
        avatar: 'avatar.jpg',
      };

      vi.mocked(fetcher).mockResolvedValue(mockProfile);

      const result = await authApi.getProfile();

      expect(fetcher).toHaveBeenCalledWith('/api/user/profile');
      expect(result).toEqual(mockProfile);
    });

    it('should handle profile fetch failure', async () => {
      const mockError = new Error('Unauthorized');
      vi.mocked(fetcher).mockRejectedValue(mockError);

      await expect(authApi.getProfile()).rejects.toThrow('Unauthorized');
      expect(fetcher).toHaveBeenCalledWith('/api/user/profile');
    });

    it('should handle server errors during profile fetch', async () => {
      const serverError = new Error('Internal server error');
      vi.mocked(fetcher).mockRejectedValue(serverError);

      await expect(authApi.getProfile()).rejects.toThrow('Internal server error');
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      // Reset localStorage mock to default behavior for integration tests
      localStorageMock.removeItem.mockImplementation(() => {});
    });

    it('should handle complete login flow', async () => {
      const credentials: LoginForm = {
        username: 'testuser',
        password: 'password123',
      };

      const loginResponse: LoginResponse = {
        success: true,
        token: 'auth-token-123',
        user: {
          id: 1,
          name: 'Test User',
          username: 'testuser',
          avatar: 'avatar.jpg',
          roles: ['admin'],
          permissions: ['user:view', 'user:create'],
        },
      };

      vi.mocked(fetcher).mockResolvedValue(loginResponse);

      // Login
      const result = await authApi.login(credentials);
      expect(result).toEqual(loginResponse);

      // Logout
      await authApi.logout();
      // Logout no longer handles localStorage - this is now done in Redux slice
    });

    it('should handle failed login followed by successful retry', async () => {
      const credentials: LoginForm = {
        username: 'testuser',
        password: 'password123',
      };

      // First attempt fails
      vi.mocked(fetcher).mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(authApi.login(credentials)).rejects.toThrow('Invalid credentials');

      // Second attempt succeeds
      const successResponse: LoginResponse = {
        success: true,
        token: 'retry-token',
        user: {
          id: 1,
          name: 'Test User',
          username: 'testuser',
          avatar: 'avatar.jpg',
          roles: ['user'],
          permissions: ['user:view'],
        },
      };

      vi.mocked(fetcher).mockResolvedValue(successResponse);

      const result = await authApi.login(credentials);
      expect(result).toEqual(successResponse);
    });
  });
});
