import type React from 'react';

import type { RouteObject } from 'react-router-dom';

import { UserListPage } from '@/features/user-management';
import DashboardPage from '@/pages/DashboardPage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Permission constants
export const Permission = {
  // User management
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',

  // Role management
  ROLE_VIEW: 'role:view',
  ROLE_MANAGE: 'role:manage',

  // System management
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',

  // Data analysis
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

// Role constants
export const Role = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

// Extended route configuration interface
export interface PermissionRouteObject extends Omit<RouteObject, 'children' | 'element'> {
  // Element can be component type or function
  element?: React.ComponentType<unknown> | (() => React.ReactElement) | React.ReactElement | null;
  // Basic authentication
  requireAuth?: boolean;
  guestOnly?: boolean;
  redirectTo?: string;

  // Permission control
  permissions?: Permission[]; // Required specific permissions
  roles?: Role[]; // Required roles
  requireAllPermissions?: boolean; // Whether all permissions are required (default: only one needed)
  requireAllRoles?: boolean; // Whether all roles are required (default: only one needed)

  // Menu configuration
  hideInMenu?: boolean; // Whether to hide in menu
  menuTitle?: string; // Menu title
  menuIcon?: string; // Menu icon
  menuOrder?: number; // Menu sort order

  // Other metadata
  meta?: {
    title?: string; // Page title
    description?: string; // Page description
    keywords?: string[]; // SEO keywords
    requiresPermissionCheck?: boolean; // Whether dynamic permission check is required
  };

  children?: PermissionRouteObject[];
}

/**
 * Complete route permission configuration
 */
export const permissionRoutes: PermissionRouteObject[] = [
  {
    path: '/',
    element: null, // Will be handled by redirect in PermissionRouteGenerator
    index: true,
    meta: { title: 'Home' },
  },

  // Login page
  {
    path: '/login',
    element: LoginPage,
    guestOnly: true,
    redirectTo: '/dashboard',
    hideInMenu: true,
    meta: {
      title: 'Login',
      description: 'User authentication page',
    },
  },

  // Dashboard
  {
    path: '/dashboard',
    element: DashboardPage,
    requireAuth: true,
    menuTitle: 'Dashboard',
    menuIcon: 'dashboard',
    menuOrder: 1,
    meta: {
      title: 'Dashboard',
      description: 'Main dashboard overview',
    },
  },

  // User management
  {
    path: '/users',
    element: UserListPage,
    requireAuth: true,
    permissions: [Permission.USER_VIEW],
    menuTitle: 'User Management',
    menuIcon: 'users',
    menuOrder: 2,
    meta: {
      title: 'Users',
      description: 'User management interface',
      requiresPermissionCheck: true,
    },
  },

  // Role management
  {
    path: '/roles',
    element: null, // TODO: Create RoleListPage
    requireAuth: true,
    permissions: [Permission.ROLE_VIEW],
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
    menuTitle: 'Role Management',
    menuIcon: 'shield',
    menuOrder: 3,
    meta: { title: 'Roles' },
  },

  // System management (requires multiple permissions)
  {
    path: '/system',
    requireAuth: true,
    permissions: [Permission.SYSTEM_CONFIG, Permission.SYSTEM_LOGS],
    requireAllPermissions: false, // Only one permission needed
    roles: [Role.SUPER_ADMIN],
    menuTitle: 'System',
    menuIcon: 'settings',
    menuOrder: 4,
    children: [
      {
        path: '/system/config',
        element: null, // TODO: Create SystemConfigPage
        permissions: [Permission.SYSTEM_CONFIG],
        menuTitle: 'Configuration',
        meta: { title: 'System Configuration' },
      },
      {
        path: '/system/logs',
        element: null, // TODO: Create SystemLogsPage
        permissions: [Permission.SYSTEM_LOGS],
        menuTitle: 'Logs',
        meta: { title: 'System Logs' },
      },
    ],
  },

  // Data analysis
  {
    path: '/analytics',
    element: null, // TODO: Create AnalyticsPage
    requireAuth: true,
    permissions: [Permission.ANALYTICS_VIEW],
    menuTitle: 'Analytics',
    menuIcon: 'chart',
    menuOrder: 5,
    meta: {
      title: 'Analytics',
    },
  },

  // 404 page
  {
    path: '*',
    element: NotFoundPage,
    hideInMenu: true,
    meta: { title: '404 Not Found' },
  },
];

/**
 * Role permission mapping
 */
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission), // Super admin has all permissions

  [Role.ADMIN]: [
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_EDIT,
    Permission.USER_DELETE,
    Permission.ROLE_VIEW,
    Permission.SYSTEM_CONFIG,
    Permission.ANALYTICS_VIEW,
  ],

  [Role.MANAGER]: [
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_EDIT,
    Permission.ANALYTICS_VIEW,
  ],

  [Role.USER]: [Permission.USER_VIEW],

  [Role.GUEST]: [],
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
