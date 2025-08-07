import type { Permission, Role } from '@/types/permission';

// Permission constants
export const PERMISSIONS = {
  // User management
  USER_VIEW: 'user:view' as Permission,
  USER_CREATE: 'user:create' as Permission,
  USER_EDIT: 'user:edit' as Permission,
  USER_DELETE: 'user:delete' as Permission,

  // Role management
  ROLE_VIEW: 'role:view' as Permission,
  ROLE_MANAGE: 'role:manage' as Permission,

  // System management
  SYSTEM_CONFIG: 'system:config' as Permission,
  SYSTEM_LOGS: 'system:logs' as Permission,

  // Data analysis
  ANALYTICS_VIEW: 'analytics:view' as Permission,
  ANALYTICS_EXPORT: 'analytics:export' as Permission,
} as const;

// Role constants
export const ROLES = {
  SUPER_ADMIN: 'super_admin' as Role,
  ADMIN: 'admin' as Role,
  MANAGER: 'manager' as Role,
  USER: 'user' as Role,
  GUEST: 'guest' as Role,
} as const;

// Role permission mapping
export const rolePermissions: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // Super admin has all permissions

  [ROLES.ADMIN]: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.ANALYTICS_VIEW,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.ANALYTICS_VIEW,
  ],

  [ROLES.USER]: [PERMISSIONS.USER_VIEW],

  [ROLES.GUEST]: [],
};

/**
 * Get all user permissions (based on roles)
 */
export const getUserPermissions = (userRoles: Role[]): Permission[] => {
  const permissions = new Set<Permission>();

  userRoles.forEach((role) => {
    rolePermissions[role]?.forEach((permission) => {
      permissions.add(permission);
    });
  });

  return Array.from(permissions);
};
