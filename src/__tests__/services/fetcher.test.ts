import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetcher } from '@/services/fetcher';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

describe('fetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock VITE_API_BASE_URL to be empty string
    vi.stubEnv('VITE_API_BASE_URL', '');
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('basic functionality', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockData),
      });

      const result = await fetcher('/api/test');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5173/api/test', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('should add Authorization header when token exists', async () => {
      localStorageMock.getItem.mockReturnValue('test-token');

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      await fetcher('/api/protected');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5173/api/protected', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      });
    });

    it('should not add Authorization header when token is empty string', async () => {
      localStorageMock.getItem.mockReturnValue(''); // Empty string is falsy

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      await fetcher('/api/test');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5173/api/test', {
        headers: {
          'Content-Type': 'application/json',
          // No Authorization header
        },
      });
    });

    it('should skip auth when skipAuth is true', async () => {
      localStorageMock.getItem.mockReturnValue('test-token');

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      await fetcher('/api/login', { skipAuth: true });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5173/api/login', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('error handling', () => {
    it('should throw error when response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ message: 'Bad Request' }),
      });

      await expect(fetcher('/api/error')).rejects.toThrow('Bad Request');
    });

    it('should throw generic error when error response has no message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      });

      await expect(fetcher('/api/error')).rejects.toThrow('Request failed');
    });

    it('should throw generic error when error response parsing fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValue(new Error('Parse error')),
      });

      await expect(fetcher('/api/error')).rejects.toThrow('Request failed');
    });
  });

  describe('response handling', () => {
    it('should return null for 204 No Content', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      const result = await fetcher('/api/delete');

      expect(result).toBeNull();
    });

    it('should parse JSON response', async () => {
      const mockData = { success: true };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockData),
      });

      const result = await fetcher('/api/data');

      expect(result).toEqual(mockData);
    });
  });

  describe('configuration', () => {
    it('should use VITE_API_BASE_URL when no custom baseUrl provided', async () => {
      // Set up environment variable
      vi.stubEnv('VITE_API_BASE_URL', 'https://prod.api.com');

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      // Need to reimport fetcher to pick up the new env var
      vi.resetModules();
      const { fetcher: freshFetcher } = await import('@/services/fetcher');

      await freshFetcher('/api/test');

      expect(mockFetch).toHaveBeenCalledWith('https://prod.api.com/api/test', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Reset back to original state
      vi.stubEnv('VITE_API_BASE_URL', '');
    });

    it('should use custom baseUrl when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      await fetcher('/api/test', { baseUrl: 'https://api.example.com' });

      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/api/test', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should merge custom headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      await fetcher('/api/test', {
        headers: {
          'Custom-Header': 'custom-value',
          'Content-Type': 'application/xml', // Should override default
        },
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5173/api/test', {
        headers: {
          'Content-Type': 'application/xml',
          'Custom-Header': 'custom-value',
        },
      });
    });

    it('should pass through other RequestInit options', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      await fetcher('/api/test', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        signal: new AbortController().signal,
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5173/api/test', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        signal: expect.any(AbortSignal),
      });
    });
  });
});
