import type { Permission, Role } from './permission';

// User interface
export interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
}

// Authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  roles: Role[];
  permissions: Permission[];
}

// Login response interface
export interface LoginResponse {
  success: boolean;
  token: string;
  user: User & {
    roles: Role[];
    permissions: Permission[];
  };
}

// Login error response interface
export interface LoginErrorResponse {
  success: false;
  message: string;
}
