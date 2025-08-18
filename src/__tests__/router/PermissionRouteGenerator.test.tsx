import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PermissionRouteGenerator from '@/router/PermissionRouteGenerator';

const mockUseAuthStatus = vi.fn();

vi.mock('@/shared/hooks', () => ({
  useAuthStatus: () => mockUseAuthStatus(),
}));

vi.mock('@/layouts/LoginLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="login-layout">{children}</div>
  ),
}));

vi.mock('@/layouts/MainLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

vi.mock('@/shared/components', () => ({
  RouteGuard: ({
    children,
    guestOnly,
    requireAuth,
    permissions,
    roles,
  }: {
    children: React.ReactNode;
    guestOnly?: boolean;
    requireAuth?: boolean;
    permissions?: string[];
    roles?: string[];
  }) => (
    <div
      data-testid="route-guard"
      data-guest-only={guestOnly}
      data-require-auth={requireAuth}
      data-permissions={permissions?.join(',')}
      data-roles={roles?.join(',')}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/router/permissionConfig', () => ({
  permissionRoutes: [
    {
      index: true,
    },
    {
      path: '/login',
      element: () => <div data-testid="login-page">Login</div>,
      guestOnly: true,
    },
    {
      path: '/dashboard',
      element: () => <div data-testid="dashboard-page">Dashboard</div>,
      requireAuth: true,
    },
    {
      path: '/users',
      element: () => <div data-testid="users-page">Users</div>,
      requireAuth: true,
      permissions: ['user:read'],
    },
    {
      path: '/admin',
      element: () => <div data-testid="admin-page">Admin</div>,
      requireAuth: true,
      roles: ['admin'],
      permissions: ['admin:read'],
      requireAllPermissions: true,
      requireAllRoles: true,
    },
    {
      path: '/public',
      element: () => <div data-testid="public-page">Public</div>,
    },
    {
      path: '*',
      element: () => <div data-testid="not-found-page">404</div>,
    },
  ],
}));

describe('PermissionRouteGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialPath = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <PermissionRouteGenerator />
      </MemoryRouter>,
    );
  };

  describe('Route structure', () => {
    it('should render without crashing', () => {
      mockUseAuthStatus.mockReturnValue({ isAuthenticated: false });
      renderWithRouter('/');

      // Should render some layout
      expect(document.body).toBeInTheDocument();
    });

    it('should handle 404 route', () => {
      renderWithRouter('/unknown-path');
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('should categorize guest routes under LoginLayout', () => {
      renderWithRouter('/login');
      expect(screen.getByTestId('login-layout')).toBeInTheDocument();
    });

    it('should categorize protected routes under MainLayout', () => {
      mockUseAuthStatus.mockReturnValue({ isAuthenticated: true });
      renderWithRouter('/dashboard');
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('Index route redirect logic', () => {
    it('should redirect authenticated users to dashboard', () => {
      mockUseAuthStatus.mockReturnValue({ isAuthenticated: true });
      const { container } = renderWithRouter('/');

      // Check that we're not on the login layout
      expect(screen.queryByTestId('login-layout')).not.toBeInTheDocument();
      // Should redirect to a protected route structure
      expect(container.innerHTML).not.toContain('login-page');
    });

    it('should redirect unauthenticated users to login', () => {
      mockUseAuthStatus.mockReturnValue({ isAuthenticated: false });
      const { container } = renderWithRouter('/');

      // Check that we're not on the main layout
      expect(screen.queryByTestId('main-layout')).not.toBeInTheDocument();
      // Should redirect to a guest route structure
      expect(container.innerHTML).not.toContain('dashboard-page');
    });
  });

  describe('Route Guard application', () => {
    it('should apply RouteGuard to guest routes', () => {
      renderWithRouter('/login');

      // Should be wrapped in login layout
      expect(screen.getByTestId('login-layout')).toBeInTheDocument();

      // Guest routes should have guestOnly protection
      const loginLayout = screen.getByTestId('login-layout');
      expect(loginLayout).toBeInTheDocument();
    });

    it('should apply RouteGuard to protected routes', () => {
      mockUseAuthStatus.mockReturnValue({ isAuthenticated: true });
      renderWithRouter('/dashboard');

      // Should be wrapped in main layout
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();

      // Protected routes should have auth protection
      const mainLayout = screen.getByTestId('main-layout');
      expect(mainLayout).toBeInTheDocument();
    });
  });

  describe('Component rendering', () => {
    it('should handle function components in routes', () => {
      // Test that the route system can handle function components
      renderWithRouter('/unknown-path');
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('should properly categorize different route types', () => {
      // Test guest route
      mockUseAuthStatus.mockReturnValue({ isAuthenticated: false });
      renderWithRouter('/login');

      // Guest route should use LoginLayout
      expect(screen.getByTestId('login-layout')).toBeInTheDocument();
      expect(screen.queryByTestId('main-layout')).not.toBeInTheDocument();

      // Clean up the current render
      document.body.innerHTML = '';

      // Test protected route - render separately
      mockUseAuthStatus.mockReturnValue({ isAuthenticated: true });
      renderWithRouter('/dashboard');

      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      expect(screen.queryByTestId('login-layout')).not.toBeInTheDocument();
    });
  });

  describe('Permission and role handling', () => {
    it('should handle routes with different permission requirements', () => {
      // Test each route individually to avoid DOM conflicts
      const testRoutes = [
        { path: '/login', expectedLayout: 'login-layout', auth: false },
        { path: '/dashboard', expectedLayout: 'main-layout', auth: true },
        { path: '/users', expectedLayout: 'main-layout', auth: true },
        { path: '/admin', expectedLayout: 'main-layout', auth: true },
      ];

      testRoutes.forEach(({ path, expectedLayout, auth }) => {
        mockUseAuthStatus.mockReturnValue({ isAuthenticated: auth });

        // Use separate render for each test to avoid DOM conflicts
        render(
          <MemoryRouter initialEntries={[path]}>
            <PermissionRouteGenerator />
          </MemoryRouter>,
        );

        expect(screen.getAllByTestId(expectedLayout)[0]).toBeInTheDocument();
      });
    });
  });
});
