import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it } from 'vitest';

import { PERMISSIONS, ROLES } from '@/shared/constants';
import { usePermissionCheck, usePermissions } from '@/shared/hooks/usePermissions';
import userSlice from '@/store/userSlice';
import type { Permission, PermissionRouteObject, Role } from '@/types/permission';

// Test wrapper with providers
const createWrapper = (
  initialState: {
    user?: {
      roles?: Role[];
      permissions?: Permission[];
    };
  } = {},
) => {
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

  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('usePermissions', () => {
  beforeEach(() => {
    // Clear any previous state
  });

  describe('Basic functionality', () => {
    it('should return user roles and permissions from state', () => {
      const mockRoles: Role[] = [ROLES.ADMIN, ROLES.USER];
      const mockPermissions: Permission[] = [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE];

      const wrapper = createWrapper({
        user: {
          roles: mockRoles,
          permissions: mockPermissions,
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.userRoles).toEqual(mockRoles);
      expect(result.current.userPermissions).toEqual(mockPermissions);
    });

    it('should handle empty roles and permissions', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.userRoles).toEqual([]);
      expect(result.current.userPermissions).toEqual([]);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has the permission', () => {
      const wrapper = createWrapper({
        user: {
          permissions: [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasPermission(PERMISSIONS.USER_VIEW)).toBe(true);
      expect(result.current.hasPermission(PERMISSIONS.USER_CREATE)).toBe(true);
    });

    it('should return false if user does not have the permission', () => {
      const wrapper = createWrapper({
        user: {
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasPermission(PERMISSIONS.USER_DELETE)).toBe(false);
      expect(result.current.hasPermission(PERMISSIONS.SYSTEM_CONFIG)).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true if user has the role', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.ADMIN, ROLES.USER],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasRole(ROLES.ADMIN)).toBe(true);
      expect(result.current.hasRole(ROLES.USER)).toBe(true);
    });

    it('should return false if user does not have the role', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.USER],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasRole(ROLES.ADMIN)).toBe(false);
      expect(result.current.hasRole(ROLES.SUPER_ADMIN)).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has at least one of the permissions', () => {
      const wrapper = createWrapper({
        user: {
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(
        result.current.hasAnyPermission([PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE]),
      ).toBe(true);
      expect(
        result.current.hasAnyPermission([PERMISSIONS.USER_DELETE, PERMISSIONS.USER_VIEW]),
      ).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      const wrapper = createWrapper({
        user: {
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(
        result.current.hasAnyPermission([PERMISSIONS.USER_CREATE, PERMISSIONS.USER_DELETE]),
      ).toBe(false);
      expect(
        result.current.hasAnyPermission([PERMISSIONS.SYSTEM_CONFIG, PERMISSIONS.ANALYTICS_VIEW]),
      ).toBe(false);
    });

    it('should return false for empty permissions array', () => {
      const wrapper = createWrapper({
        user: {
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasAnyPermission([])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all required permissions', () => {
      const wrapper = createWrapper({
        user: {
          permissions: [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE, PERMISSIONS.USER_EDIT],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(
        result.current.hasAllPermissions([PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE]),
      ).toBe(true);
      expect(result.current.hasAllPermissions([PERMISSIONS.USER_VIEW])).toBe(true);
    });

    it('should return false if user is missing any required permissions', () => {
      const wrapper = createWrapper({
        user: {
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(
        result.current.hasAllPermissions([PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE]),
      ).toBe(false);
      expect(
        result.current.hasAllPermissions([PERMISSIONS.USER_DELETE, PERMISSIONS.SYSTEM_CONFIG]),
      ).toBe(false);
    });

    it('should return true for empty permissions array', () => {
      const wrapper = createWrapper({
        user: {
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasAllPermissions([])).toBe(true);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true if user has at least one of the roles', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.USER],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasAnyRole([ROLES.ADMIN, ROLES.USER])).toBe(true);
      expect(result.current.hasAnyRole([ROLES.USER, ROLES.MANAGER])).toBe(true);
    });

    it('should return false if user has none of the roles', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.USER],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasAnyRole([ROLES.ADMIN, ROLES.MANAGER])).toBe(false);
      expect(result.current.hasAnyRole([ROLES.SUPER_ADMIN, ROLES.GUEST])).toBe(false);
    });

    it('should return false for empty roles array', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.USER],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasAnyRole([])).toBe(false);
    });
  });

  describe('hasAllRoles', () => {
    it('should return true if user has all required roles', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.ADMIN, ROLES.USER, ROLES.MANAGER],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasAllRoles([ROLES.ADMIN, ROLES.USER])).toBe(true);
      expect(result.current.hasAllRoles([ROLES.USER])).toBe(true);
    });

    it('should return false if user is missing any required roles', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.USER],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasAllRoles([ROLES.ADMIN, ROLES.USER])).toBe(false);
      expect(result.current.hasAllRoles([ROLES.SUPER_ADMIN, ROLES.MANAGER])).toBe(false);
    });

    it('should return true for empty roles array', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.USER],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasAllRoles([])).toBe(true);
    });
  });

  describe('canAccessRoute', () => {
    it('should allow access when no restrictions are set', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.USER],
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });
      const route: PermissionRouteObject = { path: '/public' };

      expect(result.current.canAccessRoute(route)).toBe(true);
    });

    it('should check role requirements with requireAllRoles=false (default)', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.USER],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      const route: PermissionRouteObject = {
        path: '/admin',
        roles: [ROLES.ADMIN, ROLES.USER],
      };

      expect(result.current.canAccessRoute(route)).toBe(true);
    });

    it('should check role requirements with requireAllRoles=true', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.USER],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      const route: PermissionRouteObject = {
        path: '/admin',
        roles: [ROLES.ADMIN, ROLES.USER],
        requireAllRoles: true,
      };

      expect(result.current.canAccessRoute(route)).toBe(false);
    });

    it('should check permission requirements with requireAllPermissions=false (default)', () => {
      const wrapper = createWrapper({
        user: {
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      const route: PermissionRouteObject = {
        path: '/users',
        permissions: [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE],
      };

      expect(result.current.canAccessRoute(route)).toBe(true);
    });

    it('should check permission requirements with requireAllPermissions=true', () => {
      const wrapper = createWrapper({
        user: {
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      const route: PermissionRouteObject = {
        path: '/users',
        permissions: [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE],
        requireAllPermissions: true,
      };

      expect(result.current.canAccessRoute(route)).toBe(false);
    });

    it('should deny access when role requirements are not met', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.USER],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      const route: PermissionRouteObject = {
        path: '/admin',
        roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
      };

      expect(result.current.canAccessRoute(route)).toBe(false);
    });

    it('should deny access when permission requirements are not met', () => {
      const wrapper = createWrapper({
        user: {
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      const route: PermissionRouteObject = {
        path: '/system',
        permissions: [PERMISSIONS.SYSTEM_CONFIG, PERMISSIONS.SYSTEM_LOGS],
      };

      expect(result.current.canAccessRoute(route)).toBe(false);
    });

    it('should require both role and permission checks to pass', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.ADMIN],
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      const route: PermissionRouteObject = {
        path: '/secure',
        roles: [ROLES.ADMIN],
        permissions: [PERMISSIONS.SYSTEM_CONFIG],
      };

      expect(result.current.canAccessRoute(route)).toBe(false);
    });
  });

  describe('getAccessibleMenuItems', () => {
    it('should filter out hidden menu items', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.ADMIN],
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      const routes: PermissionRouteObject[] = [
        { path: '/visible', menuTitle: 'Visible' },
        { path: '/hidden', menuTitle: 'Hidden', hideInMenu: true },
      ];

      const accessibleItems = result.current.getAccessibleMenuItems(routes);
      expect(accessibleItems).toHaveLength(1);
      expect(accessibleItems[0].path).toBe('/visible');
    });

    it('should filter out routes user cannot access', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.USER],
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      const routes: PermissionRouteObject[] = [
        { path: '/users', permissions: [PERMISSIONS.USER_VIEW] },
        { path: '/admin', roles: [ROLES.ADMIN] },
      ];

      const accessibleItems = result.current.getAccessibleMenuItems(routes);
      expect(accessibleItems).toHaveLength(1);
      expect(accessibleItems[0].path).toBe('/users');
    });

    it('should sort menu items by menuOrder', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.ADMIN],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      const routes: PermissionRouteObject[] = [
        { path: '/third', menuOrder: 3 },
        { path: '/first', menuOrder: 1 },
        { path: '/second', menuOrder: 2 },
        { path: '/last' }, // No order, should be 999
      ];

      const accessibleItems = result.current.getAccessibleMenuItems(routes);
      expect(accessibleItems.map((item) => item.path)).toEqual([
        '/first',
        '/second',
        '/third',
        '/last',
      ]);
    });

    it('should recursively process children', () => {
      const wrapper = createWrapper({
        user: {
          roles: [ROLES.ADMIN],
          permissions: [PERMISSIONS.USER_VIEW],
        },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      const routes: PermissionRouteObject[] = [
        {
          path: '/parent',
          children: [
            { path: '/child1', permissions: [PERMISSIONS.USER_VIEW] },
            { path: '/child2', roles: [ROLES.SUPER_ADMIN] }, // Should be filtered out
          ],
        },
      ];

      const accessibleItems = result.current.getAccessibleMenuItems(routes);
      expect(accessibleItems).toHaveLength(1);
      expect(accessibleItems[0].children).toHaveLength(1);
      expect(accessibleItems[0].children![0].path).toBe('/child1');
    });
  });

  describe('convenience methods', () => {
    describe('isSuperAdmin', () => {
      it('should return true for super admin', () => {
        const wrapper = createWrapper({
          user: {
            roles: [ROLES.SUPER_ADMIN],
          },
        });

        const { result } = renderHook(() => usePermissions(), { wrapper });
        expect(result.current.isSuperAdmin()).toBe(true);
      });

      it('should return false for non-super admin', () => {
        const wrapper = createWrapper({
          user: {
            roles: [ROLES.ADMIN, ROLES.USER],
          },
        });

        const { result } = renderHook(() => usePermissions(), { wrapper });
        expect(result.current.isSuperAdmin()).toBe(false);
      });
    });

    describe('isAdmin', () => {
      it('should return true for super admin', () => {
        const wrapper = createWrapper({
          user: {
            roles: [ROLES.SUPER_ADMIN],
          },
        });

        const { result } = renderHook(() => usePermissions(), { wrapper });
        expect(result.current.isAdmin()).toBe(true);
      });

      it('should return true for admin', () => {
        const wrapper = createWrapper({
          user: {
            roles: [ROLES.ADMIN],
          },
        });

        const { result } = renderHook(() => usePermissions(), { wrapper });
        expect(result.current.isAdmin()).toBe(true);
      });

      it('should return false for non-admin roles', () => {
        const wrapper = createWrapper({
          user: {
            roles: [ROLES.USER, ROLES.MANAGER],
          },
        });

        const { result } = renderHook(() => usePermissions(), { wrapper });
        expect(result.current.isAdmin()).toBe(false);
      });
    });
  });
});

describe('usePermissionCheck', () => {
  it('should return true when no restrictions are provided', () => {
    const wrapper = createWrapper({
      user: {
        roles: [ROLES.USER],
        permissions: [PERMISSIONS.USER_VIEW],
      },
    });

    const { result } = renderHook(() => usePermissionCheck(), { wrapper });
    expect(result.current).toBe(true);
  });

  it('should check permissions with requireAllPermissions=false (default)', () => {
    const wrapper = createWrapper({
      user: {
        permissions: [PERMISSIONS.USER_VIEW],
      },
    });

    const { result } = renderHook(
      () => usePermissionCheck([PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE]),
      { wrapper },
    );
    expect(result.current).toBe(true);
  });

  it('should check permissions with requireAllPermissions=true', () => {
    const wrapper = createWrapper({
      user: {
        permissions: [PERMISSIONS.USER_VIEW],
      },
    });

    const { result } = renderHook(
      () => usePermissionCheck([PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE], undefined, true),
      { wrapper },
    );
    expect(result.current).toBe(false);
  });

  it('should check roles with requireAllRoles=false (default)', () => {
    const wrapper = createWrapper({
      user: {
        roles: [ROLES.USER],
      },
    });

    const { result } = renderHook(() => usePermissionCheck(undefined, [ROLES.ADMIN, ROLES.USER]), {
      wrapper,
    });
    expect(result.current).toBe(true);
  });

  it('should check roles with requireAllRoles=true', () => {
    const wrapper = createWrapper({
      user: {
        roles: [ROLES.USER],
      },
    });

    const { result } = renderHook(
      () => usePermissionCheck(undefined, [ROLES.ADMIN, ROLES.USER], false, true),
      { wrapper },
    );
    expect(result.current).toBe(false);
  });

  it('should require both role and permission checks to pass', () => {
    const wrapper = createWrapper({
      user: {
        roles: [ROLES.ADMIN],
        permissions: [PERMISSIONS.USER_VIEW],
      },
    });

    const { result } = renderHook(
      () => usePermissionCheck([PERMISSIONS.SYSTEM_CONFIG], [ROLES.ADMIN]),
      { wrapper },
    );
    expect(result.current).toBe(false);
  });

  it('should pass when both role and permission checks succeed', () => {
    const wrapper = createWrapper({
      user: {
        roles: [ROLES.ADMIN],
        permissions: [PERMISSIONS.SYSTEM_CONFIG],
      },
    });

    const { result } = renderHook(
      () => usePermissionCheck([PERMISSIONS.SYSTEM_CONFIG], [ROLES.ADMIN]),
      { wrapper },
    );
    expect(result.current).toBe(true);
  });

  it('should update when dependencies change', () => {
    const wrapper = createWrapper({
      user: {
        permissions: [PERMISSIONS.USER_VIEW],
      },
    });

    const { result, rerender } = renderHook(({ permissions }) => usePermissionCheck(permissions), {
      wrapper,
      initialProps: { permissions: [PERMISSIONS.USER_VIEW] },
    });

    expect(result.current).toBe(true);

    rerender({ permissions: [PERMISSIONS.SYSTEM_CONFIG] });
    expect(result.current).toBe(false);
  });
});
