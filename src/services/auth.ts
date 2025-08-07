import type { LoginForm } from '@/shared/schemas/auth';
import type { LoginResponse } from '@/types/auth';

import { fetcher } from './fetcher';

// Auth API functions
export const authApi = {
  login: async (credentials: LoginForm): Promise<LoginResponse> => {
    const response = await fetcher<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true, // Login doesn't need existing auth
    });

    return response;
  },

  logout: async (): Promise<void> => {
    // Clear token from localStorage
    localStorage.removeItem('token');

    // In a real app, you might also call a logout endpoint
    // await fetcher('/api/auth/logout', { method: 'POST' });
  },

  getProfile: async () => {
    return fetcher('/api/user/profile');
  },
};
