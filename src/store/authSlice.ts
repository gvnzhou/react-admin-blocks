import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  avatar: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  roles: string[];
  permissions: string[];
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  roles: [],
  permissions: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ user: User; token: string }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.roles = [];
      state.permissions = [];
    },
    setRoles(state, action: PayloadAction<string[]>) {
      state.roles = action.payload;
    },
    setPermissions(state, action: PayloadAction<string[]>) {
      state.permissions = action.payload;
    },
    initializeAuth(state) {
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');
      if (token) {
        state.isAuthenticated = true;
        state.token = token;
        // User data should be fetched separately
      }
    },
  },
});

export const { loginSuccess, logout, setRoles, setPermissions, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
