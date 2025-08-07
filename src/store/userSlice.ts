import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { Permission, Role } from '@/types/auth';

interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
}

interface UserState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  roles: Role[];
  permissions: Permission[];
}

const initialState: UserState = {
  isAuthenticated: false,
  user: null,
  token: null,
  roles: ['guest'] as Role[],
  permissions: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Login success
    loginSuccess(
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        roles: Role[];
        permissions: Permission[];
      }>,
    ) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.roles = action.payload.roles;
      state.permissions = action.payload.permissions;
    },

    // Login failure
    loginFailure(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.roles = ['guest'] as Role[];
      state.permissions = [];
    },

    // Logout
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.roles = ['guest'] as Role[];
      state.permissions = [];
    },

    // Update user information
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Set roles
    setRoles(state, action: PayloadAction<Role[]>) {
      state.roles = action.payload;
    },

    // Set permissions
    setPermissions(state, action: PayloadAction<Permission[]>) {
      state.permissions = action.payload;
    },

    // Add permissions
    addPermissions(state, action: PayloadAction<Permission[]>) {
      const existing = new Set(state.permissions);
      action.payload.forEach((p) => existing.add(p));
      state.permissions = Array.from(existing);
    },

    // Remove permissions
    removePermissions(state, action: PayloadAction<Permission[]>) {
      state.permissions = state.permissions.filter((p) => !action.payload.includes(p));
    },

    // Reset to guest
    resetToGuest(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.roles = ['guest'] as Role[];
      state.permissions = [];
    },

    // Initialize authentication state
    initializeAuth(state) {
      const token = localStorage.getItem('token');
      if (token) {
        state.isAuthenticated = true;
        state.token = token;
        // User/roles/permissions should be fetched separately if needed
      }
    },
  },
});

export const {
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  setRoles,
  setPermissions,
  addPermissions,
  removePermissions,
  resetToGuest,
  initializeAuth,
} = userSlice.actions;
export default userSlice.reducer;
