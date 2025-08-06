import React from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { Permission, Role } from '@/router/permissionConfig';
import { Card, CardContent } from '@/shared/components';
import { useAuthStatus, usePermissions } from '@/shared/hooks';

interface RouteGuardProps {
  children: React.ReactNode;

  // Authentication configuration
  requireAuth?: boolean;
  guestOnly?: boolean;
  authFallbackRoute?: string;

  // Permission configuration
  permissions?: Permission[];
  roles?: Role[];
  requireAllPermissions?: boolean;
  requireAllRoles?: boolean;

  // Redirection configuration
  redirectTo?: string;
  accessDeniedComponent?: React.ComponentType<{
    missingPermissions?: Permission[];
    missingRoles?: Role[];
  }>;
}

/**
 * Default access denied component
 */
const DefaultAccessDenied = ({
  missingPermissions = [],
  missingRoles = [],
}: {
  missingPermissions?: Permission[];
  missingRoles?: Role[];
}) => (
  <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg">
    <CardContent className="pt-6">
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-red-600">Access Denied</h2>
          <p className="text-lg text-gray-700">
            You don't have sufficient permissions to access this page.
          </p>

          {missingPermissions.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-red-800 mb-2">Required Permissions:</h3>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {missingPermissions.map((permission) => (
                  <li key={permission}>{permission}</li>
                ))}
              </ul>
            </div>
          )}

          {missingRoles.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-orange-800 mb-2">Required Roles:</h3>
              <ul className="text-sm text-orange-700 list-disc list-inside">
                {missingRoles.map((role) => (
                  <li key={role}>{role.replace('_', ' ').toUpperCase()}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-sm text-gray-500">
            Contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * Unified Route Guard - Handles all access control logic
 *
 * @example
 * // Only requires authentication
 * <RouteGuard requireAuth>
 *   <DashboardPage />
 * </RouteGuard>
 *
 * @example
 * // Authentication + Permissions
 * <RouteGuard requireAuth permissions={[Permission.USER_VIEW]}>
 *   <UserListPage />
 * </RouteGuard>
 *
 * @example
 * // Guest-only (e.g., login page)
 * <RouteGuard guestOnly redirectTo="/dashboard">
 *   <LoginPage />
 * </RouteGuard>
 *
 * @example
 * // Complex permission control
 * <RouteGuard
 *   requireAuth
 *   roles={[Role.ADMIN]}
 *   permissions={[Permission.USER_DELETE]}
 *   requireAllPermissions
 * >
 *   <AdminUserManagement />
 * </RouteGuard>
 */
const RouteGuard = ({
  children,

  // Authentication configuration
  requireAuth = false,
  guestOnly = false,
  authFallbackRoute = '/login',

  // Permission configuration
  permissions = [],
  roles = [],
  requireAllPermissions = false,
  requireAllRoles = false,

  // Redirection configuration
  redirectTo = '/dashboard',
  accessDeniedComponent: AccessDeniedComponent = DefaultAccessDenied,
}: RouteGuardProps) => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStatus();
  const {
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    userPermissions,
    userRoles,
  } = usePermissions();

  // === Guest-only routes ===
  if (guestOnly) {
    if (isAuthenticated) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    return <>{children}</>;
  }

  // === Routes requiring authentication ===
  if (requireAuth || permissions.length > 0 || roles.length > 0) {
    // Check authentication first
    if (!isAuthenticated) {
      return <Navigate to={authFallbackRoute} state={{ from: location }} replace />;
    }

    // Check role permissions
    if (roles.length > 0) {
      const hasRequiredRoles = requireAllRoles ? hasAllRoles(roles) : hasAnyRole(roles);
      if (!hasRequiredRoles) {
        const missingRoles = roles.filter((role) => !userRoles.includes(role));
        return (
          <AccessDeniedComponent missingPermissions={permissions} missingRoles={missingRoles} />
        );
      }
    }

    // Check specific permissions
    if (permissions.length > 0) {
      const hasRequiredPermissions = requireAllPermissions
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);

      if (!hasRequiredPermissions) {
        const missingPermissions = permissions.filter(
          (permission) => !userPermissions.includes(permission),
        );
        return (
          <AccessDeniedComponent missingPermissions={missingPermissions} missingRoles={roles} />
        );
      }
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default RouteGuard;
