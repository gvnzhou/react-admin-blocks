import { UserListPage } from '@/features/user-management';
import DashboardPage from '@/pages/DashboardPage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { PERMISSIONS, ROLES } from '@/shared/constants';
import type { PermissionRouteObject } from '@/types/permission';

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
    permissions: [PERMISSIONS.USER_VIEW],
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
    permissions: [PERMISSIONS.ROLE_VIEW],
    roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    menuTitle: 'Role Management',
    menuIcon: 'shield',
    menuOrder: 3,
    meta: { title: 'Roles' },
  },

  // System management (requires multiple permissions)
  {
    path: '/system',
    requireAuth: true,
    permissions: [PERMISSIONS.SYSTEM_CONFIG, PERMISSIONS.SYSTEM_LOGS],
    requireAllPermissions: false, // Only one permission needed
    roles: [ROLES.SUPER_ADMIN],
    menuTitle: 'System',
    menuIcon: 'settings',
    menuOrder: 4,
    children: [
      {
        path: '/system/config',
        element: null, // TODO: Create SystemConfigPage
        permissions: [PERMISSIONS.SYSTEM_CONFIG],
        menuTitle: 'Configuration',
        meta: { title: 'System Configuration' },
      },
      {
        path: '/system/logs',
        element: null, // TODO: Create SystemLogsPage
        permissions: [PERMISSIONS.SYSTEM_LOGS],
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
    permissions: [PERMISSIONS.ANALYTICS_VIEW],
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
