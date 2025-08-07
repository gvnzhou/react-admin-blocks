import React from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';

import LoginLayout from '@/layouts/LoginLayout';
import MainLayout from '@/layouts/MainLayout';
import { RouteGuard } from '@/shared/components';
import { useAuthStatus } from '@/shared/hooks';
import type { PermissionRouteObject } from '@/types/auth';

import { permissionRoutes } from './permissionConfig';

/**
 * Index route redirect component
 */
const IndexRedirect = () => {
  const { isAuthenticated } = useAuthStatus();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

/**
 * Render component from route configuration
 */
const renderRouteElement = (
  Component: React.ComponentType | React.ReactElement | null | undefined,
) => {
  if (!Component) return null;
  if (typeof Component === 'function') return <Component />;
  return Component;
};

/**
 * Create a route with automatic access control detection
 */
const createRoute = (route: PermissionRouteObject): React.ReactElement => {
  const { path, element: Component, index } = route;

  // Handle index route specially
  if (index) {
    return <Route key="index" index element={<IndexRedirect />} />;
  }

  // Render the base component
  const baseElement = renderRouteElement(Component);

  // Apply access control if route has access control properties
  const needsGuard = !!(
    route.guestOnly ||
    route.requireAuth ||
    route.permissions?.length ||
    route.roles?.length
  );

  const element = needsGuard ? (
    <RouteGuard
      guestOnly={route.guestOnly}
      requireAuth={route.requireAuth}
      permissions={route.permissions}
      roles={route.roles}
      requireAllPermissions={route.requireAllPermissions}
      requireAllRoles={route.requireAllRoles}
      redirectTo={route.redirectTo}
    >
      {baseElement}
    </RouteGuard>
  ) : (
    baseElement
  );

  return <Route key={path} path={path} element={element} />;
};

/**
 * Permission route generator - dynamically generate routes based on configuration and permissions
 */
const PermissionRouteGenerator = () => {
  // Categorize routes
  const indexRoute = permissionRoutes.find((route) => route.index);
  const guestRoutes = permissionRoutes.filter((route) => route.guestOnly);
  const protectedRoutes = permissionRoutes.filter((route) => route.requireAuth);
  const notFoundRoute = permissionRoutes.find((route) => route.path === '*');

  return (
    <Routes>
      {/* Index route */}
      {indexRoute && createRoute(indexRoute)}

      {/* Guest-only routes (login page, etc.) */}
      <Route element={<LoginLayout />}>{guestRoutes.map((route) => createRoute(route))}</Route>

      {/* Protected routes (require authentication and permissions) */}
      <Route element={<MainLayout />}>{protectedRoutes.map((route) => createRoute(route))}</Route>

      {/* 404 route - completely public */}
      {notFoundRoute && createRoute(notFoundRoute)}
    </Routes>
  );
};

export default PermissionRouteGenerator;
