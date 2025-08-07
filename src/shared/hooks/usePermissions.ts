import { useMemo } from 'react';

import { useSelector } from 'react-redux';

import { ROLES } from '@/shared/constants';
import type { RootState } from '@/store';
import type { Permission, PermissionRouteObject, Role } from '@/types/auth';

/**
 * Permission check Hook
 */
export const usePermissions = () => {
  const { roles, permissions } = useSelector((state: RootState) => state.user);

  // User roles and permissions
  const userRoles: Role[] = roles;
  const userPermissions: Permission[] = permissions;

  /**
   * Check if user has specified permission
   */
  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };

  /**
   * Check if user has specified role
   */
  const hasRole = (role: Role): boolean => {
    return userRoles.includes(role);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  /**
   * Check if user has all specified permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: Role[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  /**
   * Check if user has all specified roles
   */
  const hasAllRoles = (roles: Role[]): boolean => {
    return roles.every((role) => hasRole(role));
  };

  /**
   * Check route permissions
   */
  const canAccessRoute = (route: PermissionRouteObject): boolean => {
    // Role check
    if (route.roles && route.roles.length > 0) {
      const roleCheck = route.requireAllRoles ? hasAllRoles(route.roles) : hasAnyRole(route.roles);

      if (!roleCheck) return false;
    }

    // Permission check
    if (route.permissions && route.permissions.length > 0) {
      const permissionCheck = route.requireAllPermissions
        ? hasAllPermissions(route.permissions)
        : hasAnyPermission(route.permissions);

      if (!permissionCheck) return false;
    }

    return true;
  };

  /**
   * Get user accessible menu items
   */
  const getAccessibleMenuItems = (routes: PermissionRouteObject[]): PermissionRouteObject[] => {
    return routes
      .filter((route) => {
        // Skip hidden menu items
        if (route.hideInMenu) return false;

        // Check permissions
        if (!canAccessRoute(route)) return false;

        // Recursively check sub-menus
        if (route.children) {
          route.children = getAccessibleMenuItems(route.children);
        }

        return true;
      })
      .sort((a, b) => (a.menuOrder || 999) - (b.menuOrder || 999));
  };

  /**
   * Check if user is super admin
   */
  const isSuperAdmin = (): boolean => {
    return hasRole(ROLES.SUPER_ADMIN);
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return hasAnyRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  };

  return {
    // User information
    userRoles,
    userPermissions,

    // Permission check methods
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    canAccessRoute,
    getAccessibleMenuItems,

    // Convenience methods
    isSuperAdmin,
    isAdmin,
  };
};

/**
 * Permission check component Hook
 */
export const usePermissionCheck = (
  permissions?: Permission[],
  roles?: Role[],
  requireAllPermissions = false,
  requireAllRoles = false,
) => {
  const { hasAnyPermission, hasAllPermissions, hasAnyRole, hasAllRoles } = usePermissions();

  return useMemo(() => {
    // Role check
    if (roles && roles.length > 0) {
      const roleCheck = requireAllRoles ? hasAllRoles(roles) : hasAnyRole(roles);
      if (!roleCheck) return false;
    }

    // Permission check
    if (permissions && permissions.length > 0) {
      const permissionCheck = requireAllPermissions
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
      if (!permissionCheck) return false;
    }

    return true;
  }, [
    permissions,
    roles,
    requireAllPermissions,
    requireAllRoles,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
  ]);
};
