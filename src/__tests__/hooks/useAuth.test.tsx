import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authApi } from '@/services/auth';
import { useAuthStatus, useLogin, useLogout } from '@/shared/hooks/useAuth';
import userSlice from '@/store/userSlice';
import type { LoginResponse } from '@/types/auth';

// Mock dependencies
vi.mock('@/services/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: null }),
  };
});

// Test wrapper with providers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createWrapper = (initialState: { user?: Partial<any> } = {}) => {
  const store = configureStore({
    reducer: {
      user: userSlice,
    },
    preloadedState: {
      user: {
        isAuthenticated: false,
        user: null,
        token: null,
        roles: [],
        permissions: [],
        ...initialState.user,
      },
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe('useAuth hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('useAuthStatus', () => {
    it('should return initial auth state', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuthStatus(), { wrapper });

      expect(result.current).toEqual({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    });

    it('should return authenticated state', () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        username: 'testuser',
        avatar: 'avatar.jpg',
      };
      const wrapper = createWrapper({
        user: {
          isAuthenticated: true,
          user: mockUser,
          token: 'mock-token',
          roles: [],
          permissions: [],
        },
      });

      const { result } = renderHook(() => useAuthStatus(), { wrapper });

      expect(result.current).toEqual({
        isAuthenticated: true,
        user: mockUser,
        token: 'mock-token',
      });
    });
  });

  describe('useLogin', () => {
    it('should handle successful login', async () => {
      const mockLoginResponse: LoginResponse = {
        success: true,
        token: 'new-token',
        user: {
          id: 1,
          name: 'Test User',
          username: 'testuser',
          avatar: 'avatar.jpg',
          roles: [],
          permissions: [],
        },
      };

      vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      await act(async () => {
        result.current.mutate({
          username: 'testuser',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authApi.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
      expect(localStorage.getItem('token')).toBe('new-token');
    });

    it('should handle login failure', async () => {
      const mockError = new Error('Invalid credentials');
      vi.mocked(authApi.login).mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      await act(async () => {
        result.current.mutate({
          username: 'testuser',
          password: 'wrong-password',
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('useLogout', () => {
    it('should handle successful logout', async () => {
      // Set up authenticated state
      localStorage.setItem('token', 'existing-token');

      vi.mocked(authApi.logout).mockResolvedValue(undefined);

      const wrapper = createWrapper({
        user: {
          isAuthenticated: true,
          user: {
            id: 1,
            name: 'Test User',
            username: 'testuser',
            avatar: 'avatar.jpg',
          },
          token: 'existing-token',
          roles: [],
          permissions: [],
        },
      });

      const { result } = renderHook(() => useLogout(), { wrapper });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authApi.logout).toHaveBeenCalled();
    });
  });
});
