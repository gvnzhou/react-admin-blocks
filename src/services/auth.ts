import type { LoginForm } from '@/shared/schemas/auth';
import { fetcher } from './fetcher';

// API response types
export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    name: string;
    username: string;
    role: string;
    avatar: string;
  };
}

export interface LoginErrorResponse {
  success: false;
  message: string;
}

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
