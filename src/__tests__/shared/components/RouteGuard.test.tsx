import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RouteGuard from '@/shared/components/RouteGuard';
import { PERMISSIONS, ROLES } from '@/shared/constants';
import * as useAuthHook from '@/shared/hooks/useAuth';
import * as usePermissionsHook from '@/shared/hooks/usePermissions';
import userSlice from '@/store/userSlice';
import type { Permission, Role } from '@/types/permission';

// Mock the hooks
vi.mock('@/shared/hooks/useAuth');
vi.mock('@/shared/hooks/usePermissions');

// Test wrapper with providers
const createWrapper = (
  initialRoute = '/',
  initialState: {
    user?: {
      isAuthenticated?: boolean;
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
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
    </Provider>
  );
};

// Test components
const TestPage = () => <div>Protected Page Content</div>;
const LoginPage = () => <div>Login Page</div>;
const DashboardPage = () => <div>Dashboard Page</div>;

describe('RouteGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
    });

    vi.mocked(usePermissionsHook.usePermissions).mockReturnValue({
      userRoles: [],
      userPermissions: [],
      hasPermission: vi.fn(() => false),
      hasRole: vi.fn(() => false),
      hasAnyPermission: vi.fn(() => false),
      hasAllPermissions: vi.fn(() => false),
      hasAnyRole: vi.fn(() => false),
      hasAllRoles: vi.fn(() => false),
      canAccessRoute: vi.fn(() => false),
      getAccessibleMenuItems: vi.fn(() => []),
      isAdmin: vi.fn(() => false),
      isSuperAdmin: vi.fn(() => false),
    });
  });

  describe('Guest-only routes', () => {
    it('should render children for unauthenticated users', () => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
      });

      render(
        <Routes>
          <Route
            path="/login"
            element={
              <RouteGuard guestOnly>
                <LoginPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/login') },
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should redirect authenticated users to dashboard', () => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', username: 'test' },
        token: 'token',
      });

      render(
        <Routes>
          <Route
            path="/login"
            element={
              <RouteGuard guestOnly>
                <LoginPage />
              </RouteGuard>
            }
          />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>,
        { wrapper: createWrapper('/login') },
      );

      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('should redirect authenticated users to custom redirectTo path', () => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', username: 'test' },
        token: 'token',
      });

      const CustomPage = () => <div>Custom Page</div>;

      render(
        <Routes>
          <Route
            path="/login"
            element={
              <RouteGuard guestOnly redirectTo="/custom">
                <LoginPage />
              </RouteGuard>
            }
          />
          <Route path="/custom" element={<CustomPage />} />
        </Routes>,
        { wrapper: createWrapper('/login') },
      );

      expect(screen.getByText('Custom Page')).toBeInTheDocument();
    });
  });

  describe('Authentication-required routes', () => {
    it('should redirect unauthenticated users to login', () => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
      });

      render(
        <Routes>
          <Route
            path="/protected"
            element={
              <RouteGuard requireAuth>
                <TestPage />
              </RouteGuard>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>,
        { wrapper: createWrapper('/protected') },
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should redirect to custom auth fallback route', () => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
      });

      const CustomLoginPage = () => <div>Custom Login</div>;

      render(
        <Routes>
          <Route
            path="/protected"
            element={
              <RouteGuard requireAuth authFallbackRoute="/custom-login">
                <TestPage />
              </RouteGuard>
            }
          />
          <Route path="/custom-login" element={<CustomLoginPage />} />
        </Routes>,
        { wrapper: createWrapper('/protected') },
      );

      expect(screen.getByText('Custom Login')).toBeInTheDocument();
    });

    it('should render children for authenticated users with no permission requirements', () => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', username: 'test' },
        token: 'token',
      });

      render(
        <Routes>
          <Route
            path="/protected"
            element={
              <RouteGuard requireAuth>
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/protected') },
      );

      expect(screen.getByText('Protected Page Content')).toBeInTheDocument();
    });
  });

  describe('Permission-based access control', () => {
    beforeEach(() => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', username: 'test' },
        token: 'token',
      });
    });

    it('should render children when user has required permissions (any)', () => {
      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.USER],
        userPermissions: [PERMISSIONS.USER_VIEW],
        hasPermission: vi.fn(() => true),
        hasRole: vi.fn(() => true),
        hasAnyPermission: vi.fn(() => true),
        hasAllPermissions: vi.fn(() => false),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => false),
        canAccessRoute: vi.fn(() => true),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/users"
            element={
              <RouteGuard permissions={[PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE]}>
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/users') },
      );

      expect(screen.getByText('Protected Page Content')).toBeInTheDocument();
    });

    it('should render children when user has all required permissions', () => {
      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.ADMIN],
        userPermissions: [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE],
        hasPermission: vi.fn(() => true),
        hasRole: vi.fn(() => true),
        hasAnyPermission: vi.fn(() => true),
        hasAllPermissions: vi.fn(() => true),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => true),
        canAccessRoute: vi.fn(() => true),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => true),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/users"
            element={
              <RouteGuard
                permissions={[PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE]}
                requireAllPermissions
              >
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/users') },
      );

      expect(screen.getByText('Protected Page Content')).toBeInTheDocument();
    });

    it('should show access denied when user lacks required permissions', () => {
      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.USER],
        userPermissions: [PERMISSIONS.USER_VIEW],
        hasPermission: vi.fn((permission) => permission === PERMISSIONS.USER_VIEW),
        hasRole: vi.fn(() => true),
        hasAnyPermission: vi.fn(() => false),
        hasAllPermissions: vi.fn(() => false),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => false),
        canAccessRoute: vi.fn(() => false),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/admin"
            element={
              <RouteGuard permissions={[PERMISSIONS.SYSTEM_CONFIG]}>
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/admin') },
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('system:config')).toBeInTheDocument();
    });

    it('should show missing permissions in access denied message', () => {
      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.USER],
        userPermissions: [],
        hasPermission: vi.fn(() => false),
        hasRole: vi.fn(() => true),
        hasAnyPermission: vi.fn(() => false),
        hasAllPermissions: vi.fn(() => false),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => false),
        canAccessRoute: vi.fn(() => false),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/admin"
            element={
              <RouteGuard permissions={[PERMISSIONS.USER_DELETE, PERMISSIONS.SYSTEM_CONFIG]}>
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/admin') },
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('Required Permissions:')).toBeInTheDocument();
      expect(screen.getByText('user:delete')).toBeInTheDocument();
      expect(screen.getByText('system:config')).toBeInTheDocument();
    });
  });

  describe('Role-based access control', () => {
    beforeEach(() => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', username: 'test' },
        token: 'token',
      });
    });

    it('should render children when user has required roles (any)', () => {
      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.ADMIN],
        userPermissions: [],
        hasPermission: vi.fn(() => false),
        hasRole: vi.fn((role) => role === ROLES.ADMIN),
        hasAnyPermission: vi.fn(() => false),
        hasAllPermissions: vi.fn(() => false),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => false),
        canAccessRoute: vi.fn(() => true),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => true),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/admin"
            element={
              <RouteGuard roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/admin') },
      );

      expect(screen.getByText('Protected Page Content')).toBeInTheDocument();
    });

    it('should render children when user has all required roles', () => {
      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.ADMIN, ROLES.MANAGER],
        userPermissions: [],
        hasPermission: vi.fn(() => false),
        hasRole: vi.fn((role) => [ROLES.ADMIN, ROLES.MANAGER].includes(role)),
        hasAnyPermission: vi.fn(() => false),
        hasAllPermissions: vi.fn(() => false),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => true),
        canAccessRoute: vi.fn(() => true),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => true),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/admin"
            element={
              <RouteGuard roles={[ROLES.ADMIN, ROLES.MANAGER]} requireAllRoles>
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/admin') },
      );

      expect(screen.getByText('Protected Page Content')).toBeInTheDocument();
    });

    it('should show access denied when user lacks required roles', () => {
      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.USER],
        userPermissions: [],
        hasPermission: vi.fn(() => false),
        hasRole: vi.fn((role) => role === ROLES.USER),
        hasAnyPermission: vi.fn(() => false),
        hasAllPermissions: vi.fn(() => false),
        hasAnyRole: vi.fn(() => false),
        hasAllRoles: vi.fn(() => false),
        canAccessRoute: vi.fn(() => false),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/admin"
            element={
              <RouteGuard roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/admin') },
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('Required Roles:')).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
      expect(screen.getByText('SUPER ADMIN')).toBeInTheDocument();
    });
  });

  describe('Combined role and permission checks', () => {
    beforeEach(() => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', username: 'test' },
        token: 'token',
      });
    });

    it('should render children when user has both required roles and permissions', () => {
      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.ADMIN],
        userPermissions: [PERMISSIONS.USER_DELETE],
        hasPermission: vi.fn((permission) => permission === PERMISSIONS.USER_DELETE),
        hasRole: vi.fn((role) => role === ROLES.ADMIN),
        hasAnyPermission: vi.fn(() => true),
        hasAllPermissions: vi.fn(() => true),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => true),
        canAccessRoute: vi.fn(() => true),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => true),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/admin/users"
            element={
              <RouteGuard roles={[ROLES.ADMIN]} permissions={[PERMISSIONS.USER_DELETE]}>
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/admin/users') },
      );

      expect(screen.getByText('Protected Page Content')).toBeInTheDocument();
    });

    it('should deny access when role check passes but permission check fails', () => {
      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.ADMIN],
        userPermissions: [PERMISSIONS.USER_VIEW],
        hasPermission: vi.fn((permission) => permission === PERMISSIONS.USER_VIEW),
        hasRole: vi.fn((role) => role === ROLES.ADMIN),
        hasAnyPermission: vi.fn(() => false),
        hasAllPermissions: vi.fn(() => false),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => true),
        canAccessRoute: vi.fn(() => false),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => true),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/admin/users"
            element={
              <RouteGuard roles={[ROLES.ADMIN]} permissions={[PERMISSIONS.USER_DELETE]}>
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/admin/users') },
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should deny access when permission check passes but role check fails', () => {
      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.USER],
        userPermissions: [PERMISSIONS.USER_DELETE],
        hasPermission: vi.fn((permission) => permission === PERMISSIONS.USER_DELETE),
        hasRole: vi.fn((role) => role === ROLES.USER),
        hasAnyPermission: vi.fn(() => true),
        hasAllPermissions: vi.fn(() => true),
        hasAnyRole: vi.fn(() => false),
        hasAllRoles: vi.fn(() => false),
        canAccessRoute: vi.fn(() => false),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/admin/users"
            element={
              <RouteGuard roles={[ROLES.ADMIN]} permissions={[PERMISSIONS.USER_DELETE]}>
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/admin/users') },
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Custom access denied component', () => {
    beforeEach(() => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', username: 'test' },
        token: 'token',
      });
    });

    it('should render custom access denied component', () => {
      const CustomAccessDenied = ({
        missingPermissions,
        missingRoles,
      }: {
        missingPermissions?: Permission[];
        missingRoles?: Role[];
      }) => (
        <div>
          Custom Access Denied
          {missingPermissions && missingPermissions.length > 0 && (
            <div>Missing permissions: {missingPermissions.join(', ')}</div>
          )}
          {missingRoles && missingRoles.length > 0 && (
            <div>Missing roles: {missingRoles.join(', ')}</div>
          )}
        </div>
      );

      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.USER],
        userPermissions: [],
        hasPermission: vi.fn(() => false),
        hasRole: vi.fn((role) => role === ROLES.USER),
        hasAnyPermission: vi.fn(() => false),
        hasAllPermissions: vi.fn(() => false),
        hasAnyRole: vi.fn(() => false),
        hasAllRoles: vi.fn(() => false),
        canAccessRoute: vi.fn(() => false),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/admin"
            element={
              <RouteGuard
                roles={[ROLES.ADMIN]}
                permissions={[PERMISSIONS.SYSTEM_CONFIG]}
                accessDeniedComponent={CustomAccessDenied}
              >
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/admin') },
      );

      expect(screen.getByText('Custom Access Denied')).toBeInTheDocument();
      expect(screen.getByText('Missing permissions: system:config')).toBeInTheDocument();
      expect(screen.getByText('Missing roles: admin')).toBeInTheDocument();
    });
  });

  describe('Implicit authentication requirements', () => {
    it('should require authentication when permissions are specified', () => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
      });

      render(
        <Routes>
          <Route
            path="/users"
            element={
              <RouteGuard permissions={[PERMISSIONS.USER_VIEW]}>
                <TestPage />
              </RouteGuard>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>,
        { wrapper: createWrapper('/users') },
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should require authentication when roles are specified', () => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
      });

      render(
        <Routes>
          <Route
            path="/admin"
            element={
              <RouteGuard roles={[ROLES.ADMIN]}>
                <TestPage />
              </RouteGuard>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>,
        { wrapper: createWrapper('/admin') },
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('Route with no restrictions', () => {
    it('should render children for public routes', () => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
      });

      render(
        <Routes>
          <Route
            path="/public"
            element={
              <RouteGuard>
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/public') },
      );

      expect(screen.getByText('Protected Page Content')).toBeInTheDocument();
    });
  });

  describe('Default access denied component', () => {
    beforeEach(() => {
      vi.mocked(useAuthHook.useAuthStatus).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', username: 'test' },
        token: 'token',
      });
    });

    it('should show appropriate UI elements in default access denied component', () => {
      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.USER],
        userPermissions: [],
        hasPermission: vi.fn(() => false),
        hasRole: vi.fn(() => false),
        hasAnyPermission: vi.fn(() => false),
        hasAllPermissions: vi.fn(() => false),
        hasAnyRole: vi.fn(() => false),
        hasAllRoles: vi.fn(() => false),
        canAccessRoute: vi.fn(() => false),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/admin"
            element={
              <RouteGuard
                roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
                permissions={[PERMISSIONS.SYSTEM_CONFIG, PERMISSIONS.SYSTEM_LOGS]}
              >
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/admin') },
      );

      // Check main error message
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(
        screen.getByText("You don't have sufficient permissions to access this page."),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Contact your administrator if you believe this is an error.'),
      ).toBeInTheDocument();

      // Check permissions section
      expect(screen.getByText('Required Permissions:')).toBeInTheDocument();
      expect(screen.getByText('system:config')).toBeInTheDocument();
      expect(screen.getByText('system:logs')).toBeInTheDocument();

      // Check roles section
      expect(screen.getByText('Required Roles:')).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
      expect(screen.getByText('SUPER ADMIN')).toBeInTheDocument();
    });

    it('should only show missing permissions when no roles are required', () => {
      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.USER],
        userPermissions: [],
        hasPermission: vi.fn(() => false),
        hasRole: vi.fn(() => true),
        hasAnyPermission: vi.fn(() => false),
        hasAllPermissions: vi.fn(() => false),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => true),
        canAccessRoute: vi.fn(() => false),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/users"
            element={
              <RouteGuard permissions={[PERMISSIONS.USER_DELETE]}>
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/users') },
      );

      expect(screen.getByText('Required Permissions:')).toBeInTheDocument();
      expect(screen.getByText('user:delete')).toBeInTheDocument();
      expect(screen.queryByText('Required Roles:')).not.toBeInTheDocument();
    });

    it('should only show missing roles when no permissions are required', () => {
      const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
      mockUsePermissions.mockReturnValue({
        userRoles: [ROLES.USER],
        userPermissions: [PERMISSIONS.USER_VIEW],
        hasPermission: vi.fn(() => true),
        hasRole: vi.fn((role) => role === ROLES.USER),
        hasAnyPermission: vi.fn(() => true),
        hasAllPermissions: vi.fn(() => true),
        hasAnyRole: vi.fn(() => false),
        hasAllRoles: vi.fn(() => false),
        canAccessRoute: vi.fn(() => false),
        getAccessibleMenuItems: vi.fn(() => []),
        isAdmin: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
      });

      render(
        <Routes>
          <Route
            path="/admin"
            element={
              <RouteGuard roles={[ROLES.ADMIN]}>
                <TestPage />
              </RouteGuard>
            }
          />
        </Routes>,
        { wrapper: createWrapper('/admin') },
      );

      expect(screen.getByText('Required Roles:')).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
      expect(screen.queryByText('Required Permissions:')).not.toBeInTheDocument();
    });
  });
});
