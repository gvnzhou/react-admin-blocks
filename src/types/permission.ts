import type React from 'react';

import type { RouteObject } from 'react-router-dom';

// Permission type definition
export type Permission =
  // User management
  | 'user:view'
  | 'user:create'
  | 'user:edit'
  | 'user:delete'

  // Role management
  | 'role:view'
  | 'role:manage'

  // System management
  | 'system:config'
  | 'system:logs'

  // Data analysis
  | 'analytics:view'
  | 'analytics:export';

// Role type definition
export type Role = 'super_admin' | 'admin' | 'manager' | 'user' | 'guest';

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
