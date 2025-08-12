import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PERMISSIONS, ROLES } from '@/shared/constants';
import userSlice, {
  addPermissions,
  initializeAuth,
  loginFailure,
  loginSuccess,
  logout,
  removePermissions,
  resetToGuest,
  setPermissions,
  setRoles,
  updateUser,
} from '@/store/userSlice';
import type { User } from '@/types/auth';
import type { Permission, Role } from '@/types/permission';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('userSlice', () => {
  const mockUser: User = {
    id: 1,
    name: 'Test User',
    username: 'testuser',
    avatar: 'avatar.jpg',
  };

  const mockRoles: Role[] = [ROLES.ADMIN, ROLES.USER];
  const mockPermissions: Permission[] = [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = userSlice(undefined, { type: '' });

      expect(state).toEqual({
        isAuthenticated: false,
        user: null,
        token: null,
        roles: ['guest'],
        permissions: [],
      });
    });
  });

  describe('loginSuccess', () => {
    it('should handle successful login', () => {
      const initialState = {
        isAuthenticated: false,
        user: null,
        token: null,
        roles: ['guest'] as Role[],
        permissions: [],
      };

      const action = loginSuccess({
        user: mockUser,
        token: 'test-token',
        roles: mockRoles,
        permissions: mockPermissions,
      });

      const state = userSlice(initialState, action);

      expect(state).toEqual({
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
        roles: mockRoles,
        permissions: mockPermissions,
      });
    });
  });

  describe('loginFailure', () => {
    it('should handle login failure', () => {
      const initialState = {
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
        roles: mockRoles,
        permissions: mockPermissions,
      };

      const action = loginFailure();
      const state = userSlice(initialState, action);

      expect(state).toEqual({
        isAuthenticated: false,
        user: null,
        token: null,
        roles: ['guest'],
        permissions: [],
      });
    });
  });

  describe('logout', () => {
    it('should handle logout', () => {
      const initialState = {
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
        roles: mockRoles,
        permissions: mockPermissions,
      };

      const action = logout();
      const state = userSlice(initialState, action);

      expect(state).toEqual({
        isAuthenticated: false,
        user: null,
        token: null,
        roles: ['guest'],
        permissions: [],
      });
    });
  });

  describe('updateUser', () => {
    it('should update user information when user exists', () => {
      const initialState = {
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
        roles: mockRoles,
        permissions: mockPermissions,
      };

      const updates = { name: 'Updated Name', avatar: 'new-avatar.jpg' };
      const action = updateUser(updates);
      const state = userSlice(initialState, action);

      expect(state.user).toEqual({
        ...mockUser,
        ...updates,
      });
    });

    it('should not update user when user is null', () => {
      const initialState = {
        isAuthenticated: false,
        user: null,
        token: null,
        roles: ['guest'] as Role[],
        permissions: [],
      };

      const updates = { name: 'Updated Name' };
      const action = updateUser(updates);
      const state = userSlice(initialState, action);

      expect(state.user).toBeNull();
    });
  });

  describe('setRoles', () => {
    it('should set user roles', () => {
      const initialState = {
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
        roles: ['guest'] as Role[],
        permissions: [],
      };

      const newRoles: Role[] = [ROLES.ADMIN, ROLES.MANAGER];
      const action = setRoles(newRoles);
      const state = userSlice(initialState, action);

      expect(state.roles).toEqual(newRoles);
    });
  });

  describe('setPermissions', () => {
    it('should set user permissions', () => {
      const initialState = {
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
        roles: mockRoles,
        permissions: [],
      };

      const newPermissions: Permission[] = [PERMISSIONS.USER_EDIT, PERMISSIONS.USER_DELETE];
      const action = setPermissions(newPermissions);
      const state = userSlice(initialState, action);

      expect(state.permissions).toEqual(newPermissions);
    });
  });

  describe('addPermissions', () => {
    it('should add new permissions to existing ones', () => {
      const initialState = {
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
        roles: mockRoles,
        permissions: [PERMISSIONS.USER_VIEW],
      };

      const newPermissions: Permission[] = [PERMISSIONS.USER_CREATE, PERMISSIONS.USER_EDIT];
      const action = addPermissions(newPermissions);
      const state = userSlice(initialState, action);

      expect(state.permissions).toContain(PERMISSIONS.USER_VIEW);
      expect(state.permissions).toContain(PERMISSIONS.USER_CREATE);
      expect(state.permissions).toContain(PERMISSIONS.USER_EDIT);
      expect(state.permissions).toHaveLength(3);
    });

    it('should not add duplicate permissions', () => {
      const initialState = {
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
        roles: mockRoles,
        permissions: [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE],
      };

      const duplicatePermissions: Permission[] = [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_EDIT];
      const action = addPermissions(duplicatePermissions);
      const state = userSlice(initialState, action);

      expect(state.permissions).toContain(PERMISSIONS.USER_VIEW);
      expect(state.permissions).toContain(PERMISSIONS.USER_CREATE);
      expect(state.permissions).toContain(PERMISSIONS.USER_EDIT);
      expect(state.permissions).toHaveLength(3);
    });
  });

  describe('removePermissions', () => {
    it('should remove specified permissions', () => {
      const initialState = {
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
        roles: mockRoles,
        permissions: [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE, PERMISSIONS.USER_EDIT],
      };

      const permissionsToRemove: Permission[] = [PERMISSIONS.USER_CREATE, PERMISSIONS.USER_EDIT];
      const action = removePermissions(permissionsToRemove);
      const state = userSlice(initialState, action);

      expect(state.permissions).toEqual([PERMISSIONS.USER_VIEW]);
    });

    it('should handle removing non-existent permissions', () => {
      const initialState = {
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
        roles: mockRoles,
        permissions: [PERMISSIONS.USER_VIEW],
      };

      const permissionsToRemove: Permission[] = [PERMISSIONS.USER_DELETE];
      const action = removePermissions(permissionsToRemove);
      const state = userSlice(initialState, action);

      expect(state.permissions).toEqual([PERMISSIONS.USER_VIEW]);
    });
  });

  describe('resetToGuest', () => {
    it('should reset state to guest', () => {
      const initialState = {
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
        roles: mockRoles,
        permissions: mockPermissions,
      };

      const action = resetToGuest();
      const state = userSlice(initialState, action);

      expect(state).toEqual({
        isAuthenticated: false,
        user: null,
        token: null,
        roles: ['guest'],
        permissions: [],
      });
    });
  });

  describe('initializeAuth', () => {
    it('should initialize authentication state when token exists in localStorage', () => {
      const initialState = {
        isAuthenticated: false,
        user: null,
        token: null,
        roles: ['guest'] as Role[],
        permissions: [],
      };

      localStorageMock.getItem.mockReturnValue('stored-token');

      const action = initializeAuth();
      const state = userSlice(initialState, action);

      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe('stored-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    });

    it('should not initialize authentication when no token in localStorage', () => {
      const initialState = {
        isAuthenticated: false,
        user: null,
        token: null,
        roles: ['guest'] as Role[],
        permissions: [],
      };

      localStorageMock.getItem.mockReturnValue(null);

      const action = initializeAuth();
      const state = userSlice(initialState, action);

      expect(state.isAuthenticated).toBe(false);
      expect(state.token).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    });
  });
});
