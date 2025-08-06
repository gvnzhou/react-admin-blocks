import React from 'react';

import { Permission, Role } from '@/router/permissionConfig';
import { usePermissionCheck, usePermissions } from '@/shared/hooks';

interface ComponentGuardProps {
  children: React.ReactNode;

  // Permission configuration
  permissions?: Permission[];
  roles?: Role[];
  requireAllPermissions?: boolean;
  requireAllRoles?: boolean;

  // Display when no permission
  fallback?: React.ReactNode; // Custom fallback UI
  hideWhenNoPermission?: boolean; // Hide component entirely
}

/**
 * Component Guard - Controls display/hide at the component level
 *
 * @example
 * // Only users with user edit permission can see the edit button
 * <ComponentGuard permissions={[Permission.USER_EDIT]}>
 *   <Button>Edit User</Button>
 * </ComponentGuard>
 *
 * @example
 * // Only administrators can see the delete button
 * <ComponentGuard roles={[Role.ADMIN, Role.SUPER_ADMIN]}>
 *   <Button variant="destructive">Delete User</Button>
 * </ComponentGuard>
 *
 * @example
 * // Custom fallback
 * <ComponentGuard
 *   permissions={[Permission.USER_EDIT]}
 *   fallback={<span className="text-gray-400">No permission to edit</span>}
 * >
 *   <Button>Edit User</Button>
 * </ComponentGuard>
 */
const ComponentGuard = ({
  children,
  permissions,
  roles,
  requireAllPermissions = false,
  requireAllRoles = false,
  fallback,
  hideWhenNoPermission = false,
}: ComponentGuardProps) => {
  const hasPermission = usePermissionCheck(
    permissions,
    roles,
    requireAllPermissions,
    requireAllRoles,
  );

  if (!hasPermission) {
    if (hideWhenNoPermission) return null;
    if (fallback) return <>{fallback}</>;
    return null;
  }

  return <>{children}</>;
};

interface PermissionTextProps {
  permissions?: Permission[];
  roles?: Role[];
  requireAllPermissions?: boolean;
  requireAllRoles?: boolean;

  allowedText: string;
  deniedText?: string;
  className?: string;
}

/**
 * Displays text based on permission status.
 */
export const PermissionText = ({
  permissions,
  roles,
  requireAllPermissions,
  requireAllRoles,
  allowedText,
  deniedText = 'No Access',
  className,
}: PermissionTextProps) => {
  const hasPermission = usePermissionCheck(
    permissions,
    roles,
    requireAllPermissions,
    requireAllRoles,
  );

  return <span className={className}>{hasPermission ? allowedText : deniedText}</span>;
};

interface IfPermissionProps {
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

/**
 * Renders children if user has specified permissions.
 */
export const IfPermission = ({
  permissions,
  children,
  fallback,
  requireAll = false,
}: IfPermissionProps) => (
  <ComponentGuard
    permissions={permissions}
    requireAllPermissions={requireAll}
    hideWhenNoPermission
    fallback={fallback}
  >
    {children}
  </ComponentGuard>
);

interface IfRoleProps {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

/**
 * Renders children if user has specified roles.
 */
export const IfRole = ({ roles, children, fallback, requireAll = false }: IfRoleProps) => (
  <ComponentGuard
    roles={roles}
    requireAllRoles={requireAll}
    hideWhenNoPermission
    fallback={fallback}
  >
    {children}
  </ComponentGuard>
);

interface IfAdminProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renders children if user is an Admin (or Super Admin).
 */
export const IfAdmin = ({ children, fallback }: IfAdminProps) => {
  const { isAdmin } = usePermissions();
  return isAdmin() ? <>{children}</> : fallback || null;
};

interface IfSuperAdminProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renders children if user is a Super Admin.
 */
export const IfSuperAdmin = ({ children, fallback }: IfSuperAdminProps) => {
  const { isSuperAdmin } = usePermissions();
  return isSuperAdmin() ? <>{children}</> : fallback || null;
};

export default ComponentGuard;
