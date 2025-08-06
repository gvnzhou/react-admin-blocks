import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Role } from '@/router/permissionConfig';

interface User {
  id: number;
  name: string;
  username: string;
  role: Role; // Primary role
  avatar: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean; // Authentication loading state
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Start login
    loginStart(state) {
      state.isLoading = true;
    },

    // Login success
    loginSuccess(state, action: PayloadAction<{ user: User; token: string }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoading = false;
    },

    // Login failure
    loginFailure(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.isLoading = false;
    },

    // Logout
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.isLoading = false;
    },

    // Update user information
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Initialize authentication state
    initializeAuth(state) {
      const token = localStorage.getItem('token');
      if (token) {
        state.isAuthenticated = true;
        state.token = token;
        // User data should be fetched separately
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, initializeAuth } =
  authSlice.actions;
export default authSlice.reducer;
