import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Permission, Role, getUserPermissions } from '@/router/permissionConfig';

interface PermissionState {
  roles: Role[]; // User roles
  permissions: Permission[]; // User permissions
  isLoading: boolean; // Permission loading state
  lastFetchTime: number | null; // Last permission fetch time
}

const initialState: PermissionState = {
  roles: ['guest'] as Role[], // Use string literal to avoid circular dependency
  permissions: [],
  isLoading: false,
  lastFetchTime: null,
};

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    // Set user roles (usually called after login)
    setRoles(state, action: PayloadAction<Role[]>) {
      state.roles = action.payload;
      // Automatically calculate role-based permissions
      state.permissions = getUserPermissions(action.payload);
      state.lastFetchTime = Date.now();
    },

    // Set user permissions (to override default permissions)
    setPermissions(state, action: PayloadAction<Permission[]>) {
      state.permissions = action.payload;
      state.lastFetchTime = Date.now();
    },

    // Add additional permissions
    addPermissions(state, action: PayloadAction<Permission[]>) {
      const existingPermissions = new Set(state.permissions);
      action.payload.forEach((permission) => {
        existingPermissions.add(permission);
      });
      state.permissions = Array.from(existingPermissions);
    },

    // Remove permissions
    removePermissions(state, action: PayloadAction<Permission[]>) {
      state.permissions = state.permissions.filter(
        (permission) => !action.payload.includes(permission),
      );
    },

    // Start permission loading
    setPermissionLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    // Clear permissions (called on logout)
    clearPermissions(state) {
      state.roles = ['guest'] as Role[];
      state.permissions = [];
      state.isLoading = false;
      state.lastFetchTime = null;
    },

    // Reset to guest permissions
    resetToGuest(state) {
      state.roles = ['guest'] as Role[];
      state.permissions = getUserPermissions(['guest'] as Role[]);
      state.isLoading = false;
      state.lastFetchTime = Date.now();
    },
  },
});

export const {
  setRoles,
  setPermissions,
  addPermissions,
  removePermissions,
  setPermissionLoading,
  clearPermissions,
  resetToGuest,
} = permissionSlice.actions;

export default permissionSlice.reducer;
