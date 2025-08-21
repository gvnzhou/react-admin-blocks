import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ComponentGuard, {
  IfAdmin,
  IfPermission,
  IfRole,
  IfSuperAdmin,
  PermissionText,
} from '@/shared/components/ComponentGuard';
import { PERMISSIONS, ROLES } from '@/shared/constants';
import * as usePermissionsHook from '@/shared/hooks/usePermissions';
import userSlice from '@/store/userSlice';
import type { Permission, Role } from '@/types/permission';

// Mock the permission hooks
vi.mock('@/shared/hooks/usePermissions');

// Test wrapper with providers
const createWrapper = (
  initialState: {
    user?: {
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
    <Provider store={store}>{children}</Provider>
  );
};

describe('ComponentGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should render children when user has permission', () => {
      vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(true);

      const TestComponent = () => <div>Protected Content</div>;

      render(
        <ComponentGuard permissions={[PERMISSIONS.USER_VIEW]}>
          <TestComponent />
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should not render children when user lacks permission', () => {
      vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(false);

      const TestComponent = () => <div>Protected Content</div>;

      render(
        <ComponentGuard permissions={[PERMISSIONS.USER_VIEW]}>
          <TestComponent />
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render children when no permissions or roles are specified', () => {
      vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(true);

      const TestComponent = () => <div>Public Content</div>;

      render(
        <ComponentGuard>
          <TestComponent />
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
    });
  });

  describe('Permission-based access control', () => {
    it('should pass correct permissions to usePermissionCheck', () => {
      const mockUsePermissionCheck = vi.mocked(usePermissionsHook.usePermissionCheck);
      mockUsePermissionCheck.mockReturnValue(true);

      render(
        <ComponentGuard
          permissions={[PERMISSIONS.USER_VIEW, PERMISSIONS.USER_EDIT]}
          requireAllPermissions={true}
        >
          <div>Content</div>
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(mockUsePermissionCheck).toHaveBeenCalledWith(
        [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_EDIT],
        undefined,
        true,
        false,
      );
    });

    it('should work with single permission', () => {
      vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(true);

      render(
        <ComponentGuard permissions={[PERMISSIONS.USER_VIEW]}>
          <div>User Content</div>
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(screen.getByText('User Content')).toBeInTheDocument();
    });

    it('should work with multiple permissions and requireAllPermissions=false', () => {
      const mockUsePermissionCheck = vi.mocked(usePermissionsHook.usePermissionCheck);
      mockUsePermissionCheck.mockReturnValue(true);

      render(
        <ComponentGuard
          permissions={[PERMISSIONS.USER_VIEW, PERMISSIONS.USER_EDIT]}
          requireAllPermissions={false}
        >
          <div>Content</div>
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(mockUsePermissionCheck).toHaveBeenCalledWith(
        [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_EDIT],
        undefined,
        false,
        false,
      );
    });
  });

  describe('Role-based access control', () => {
    it('should pass correct roles to usePermissionCheck', () => {
      const mockUsePermissionCheck = vi.mocked(usePermissionsHook.usePermissionCheck);
      mockUsePermissionCheck.mockReturnValue(true);

      render(
        <ComponentGuard roles={[ROLES.ADMIN, ROLES.MANAGER]} requireAllRoles={true}>
          <div>Admin Content</div>
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(mockUsePermissionCheck).toHaveBeenCalledWith(
        undefined,
        [ROLES.ADMIN, ROLES.MANAGER],
        false,
        true,
      );
    });

    it('should work with single role', () => {
      vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(true);

      render(
        <ComponentGuard roles={[ROLES.ADMIN]}>
          <div>Admin Content</div>
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  describe('Combined permission and role checks', () => {
    it('should pass both permissions and roles to usePermissionCheck', () => {
      const mockUsePermissionCheck = vi.mocked(usePermissionsHook.usePermissionCheck);
      mockUsePermissionCheck.mockReturnValue(true);

      render(
        <ComponentGuard
          permissions={[PERMISSIONS.USER_EDIT]}
          roles={[ROLES.ADMIN]}
          requireAllPermissions={true}
          requireAllRoles={true}
        >
          <div>Complex Content</div>
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(mockUsePermissionCheck).toHaveBeenCalledWith(
        [PERMISSIONS.USER_EDIT],
        [ROLES.ADMIN],
        true,
        true,
      );
    });

    it('should deny access when permission check fails', () => {
      vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(false);

      render(
        <ComponentGuard permissions={[PERMISSIONS.USER_EDIT]} roles={[ROLES.ADMIN]}>
          <div>Complex Content</div>
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(screen.queryByText('Complex Content')).not.toBeInTheDocument();
    });
  });

  describe('Fallback behavior', () => {
    it('should render fallback when provided and user lacks permission', () => {
      vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(false);

      render(
        <ComponentGuard permissions={[PERMISSIONS.USER_EDIT]} fallback={<div>Access Denied</div>}>
          <div>Protected Content</div>
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render nothing when hideWhenNoPermission=true and no fallback', () => {
      vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(false);

      const { container } = render(
        <ComponentGuard permissions={[PERMISSIONS.USER_EDIT]} hideWhenNoPermission>
          <div>Protected Content</div>
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(container.firstChild).toBeNull();
    });

    it('should prioritize hideWhenNoPermission over fallback', () => {
      vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(false);

      const { container } = render(
        <ComponentGuard
          permissions={[PERMISSIONS.USER_EDIT]}
          hideWhenNoPermission
          fallback={<div>Custom Fallback</div>}
        >
          <div>Protected Content</div>
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render null when no permission and no fallback or hide option', () => {
      vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(false);

      const { container } = render(
        <ComponentGuard permissions={[PERMISSIONS.USER_EDIT]}>
          <div>Protected Content</div>
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Default values', () => {
    it('should use correct default values for requireAll flags', () => {
      const mockUsePermissionCheck = vi.mocked(usePermissionsHook.usePermissionCheck);
      mockUsePermissionCheck.mockReturnValue(true);

      render(
        <ComponentGuard permissions={[PERMISSIONS.USER_VIEW]} roles={[ROLES.USER]}>
          <div>Content</div>
        </ComponentGuard>,
        { wrapper: createWrapper() },
      );

      expect(mockUsePermissionCheck).toHaveBeenCalledWith(
        [PERMISSIONS.USER_VIEW],
        [ROLES.USER],
        false, // requireAllPermissions default
        false, // requireAllRoles default
      );
    });
  });
});

describe('PermissionText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display allowed text when user has permission', () => {
    vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(true);

    render(
      <PermissionText permissions={[PERMISSIONS.USER_VIEW]} allowedText="You can view users" />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('You can view users')).toBeInTheDocument();
  });

  it('should display denied text when user lacks permission', () => {
    vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(false);

    render(
      <PermissionText
        permissions={[PERMISSIONS.USER_VIEW]}
        allowedText="You can view users"
        deniedText="Access denied"
      />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('Access denied')).toBeInTheDocument();
  });

  it('should use default denied text when none provided', () => {
    vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(false);

    render(<PermissionText permissions={[PERMISSIONS.USER_VIEW]} allowedText="Allowed" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('No Access')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(true);

    render(
      <PermissionText
        permissions={[PERMISSIONS.USER_VIEW]}
        allowedText="Allowed"
        className="text-green-500"
      />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('Allowed')).toHaveClass('text-green-500');
  });

  it('should pass correct parameters to usePermissionCheck', () => {
    const mockUsePermissionCheck = vi.mocked(usePermissionsHook.usePermissionCheck);
    mockUsePermissionCheck.mockReturnValue(true);

    render(
      <PermissionText
        permissions={[PERMISSIONS.USER_EDIT]}
        roles={[ROLES.ADMIN]}
        requireAllPermissions={true}
        requireAllRoles={true}
        allowedText="Allowed"
      />,
      { wrapper: createWrapper() },
    );

    expect(mockUsePermissionCheck).toHaveBeenCalledWith(
      [PERMISSIONS.USER_EDIT],
      [ROLES.ADMIN],
      true,
      true,
    );
  });
});

describe('IfPermission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user has required permissions', () => {
    vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(true);

    render(
      <IfPermission permissions={[PERMISSIONS.USER_VIEW]}>
        <div>User Content</div>
      </IfPermission>,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('User Content')).toBeInTheDocument();
  });

  it('should not render children when user lacks permissions', () => {
    vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(false);

    render(
      <IfPermission permissions={[PERMISSIONS.USER_VIEW]}>
        <div>User Content</div>
      </IfPermission>,
      { wrapper: createWrapper() },
    );

    expect(screen.queryByText('User Content')).not.toBeInTheDocument();
  });

  it('should not render fallback when user lacks permission (hideWhenNoPermission=true)', () => {
    vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(false);

    const { container } = render(
      <IfPermission permissions={[PERMISSIONS.USER_VIEW]} fallback={<div>No Permission</div>}>
        <div>User Content</div>
      </IfPermission>,
      { wrapper: createWrapper() },
    );

    // IfPermission uses hideWhenNoPermission=true, so fallback won't be shown
    expect(container.firstChild).toBeNull();
  });

  it('should pass requireAll parameter correctly', () => {
    const mockUsePermissionCheck = vi.mocked(usePermissionsHook.usePermissionCheck);
    mockUsePermissionCheck.mockReturnValue(true);

    render(
      <IfPermission permissions={[PERMISSIONS.USER_VIEW, PERMISSIONS.USER_EDIT]} requireAll={true}>
        <div>Content</div>
      </IfPermission>,
      { wrapper: createWrapper() },
    );

    expect(mockUsePermissionCheck).toHaveBeenCalledWith(
      [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_EDIT],
      undefined,
      true,
      false,
    );
  });
});

describe('IfRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user has required roles', () => {
    vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(true);

    render(
      <IfRole roles={[ROLES.ADMIN]}>
        <div>Admin Content</div>
      </IfRole>,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should not render children when user lacks roles', () => {
    vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(false);

    render(
      <IfRole roles={[ROLES.ADMIN]}>
        <div>Admin Content</div>
      </IfRole>,
      { wrapper: createWrapper() },
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should not render fallback when user lacks role (hideWhenNoPermission=true)', () => {
    vi.mocked(usePermissionsHook.usePermissionCheck).mockReturnValue(false);

    const { container } = render(
      <IfRole roles={[ROLES.ADMIN]} fallback={<div>Not Admin</div>}>
        <div>Admin Content</div>
      </IfRole>,
      { wrapper: createWrapper() },
    );

    // IfRole uses hideWhenNoPermission=true, so fallback won't be shown
    expect(container.firstChild).toBeNull();
  });

  it('should pass requireAll parameter correctly', () => {
    const mockUsePermissionCheck = vi.mocked(usePermissionsHook.usePermissionCheck);
    mockUsePermissionCheck.mockReturnValue(true);

    render(
      <IfRole roles={[ROLES.ADMIN, ROLES.MANAGER]} requireAll={true}>
        <div>Content</div>
      </IfRole>,
      { wrapper: createWrapper() },
    );

    expect(mockUsePermissionCheck).toHaveBeenCalledWith(
      undefined,
      [ROLES.ADMIN, ROLES.MANAGER],
      false,
      true,
    );
  });
});

describe('IfAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user is admin', () => {
    const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
    mockUsePermissions.mockReturnValue({
      isAdmin: () => true,
      isSuperAdmin: () => false,
      userRoles: [ROLES.ADMIN],
      userPermissions: [],
      hasPermission: vi.fn(),
      hasRole: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      canAccessRoute: vi.fn(),
      getAccessibleMenuItems: vi.fn(),
    });

    render(
      <IfAdmin>
        <div>Admin Panel</div>
      </IfAdmin>,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('should not render children when user is not admin', () => {
    const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
    mockUsePermissions.mockReturnValue({
      isAdmin: () => false,
      isSuperAdmin: () => false,
      userRoles: [ROLES.USER],
      userPermissions: [],
      hasPermission: vi.fn(),
      hasRole: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      canAccessRoute: vi.fn(),
      getAccessibleMenuItems: vi.fn(),
    });

    render(
      <IfAdmin>
        <div>Admin Panel</div>
      </IfAdmin>,
      { wrapper: createWrapper() },
    );

    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('should render fallback when user is not admin', () => {
    const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
    mockUsePermissions.mockReturnValue({
      isAdmin: () => false,
      isSuperAdmin: () => false,
      userRoles: [ROLES.USER],
      userPermissions: [],
      hasPermission: vi.fn(),
      hasRole: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      canAccessRoute: vi.fn(),
      getAccessibleMenuItems: vi.fn(),
    });

    render(
      <IfAdmin fallback={<div>Regular User</div>}>
        <div>Admin Panel</div>
      </IfAdmin>,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('Regular User')).toBeInTheDocument();
  });
});

describe('IfSuperAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user is super admin', () => {
    const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
    mockUsePermissions.mockReturnValue({
      isSuperAdmin: () => true,
      isAdmin: () => true,
      userRoles: [ROLES.SUPER_ADMIN],
      userPermissions: [],
      hasPermission: vi.fn(),
      hasRole: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      canAccessRoute: vi.fn(),
      getAccessibleMenuItems: vi.fn(),
    });

    render(
      <IfSuperAdmin>
        <div>Super Admin Panel</div>
      </IfSuperAdmin>,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('Super Admin Panel')).toBeInTheDocument();
  });

  it('should not render children when user is not super admin', () => {
    const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
    mockUsePermissions.mockReturnValue({
      isSuperAdmin: () => false,
      isAdmin: () => true,
      userRoles: [ROLES.ADMIN],
      userPermissions: [],
      hasPermission: vi.fn(),
      hasRole: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      canAccessRoute: vi.fn(),
      getAccessibleMenuItems: vi.fn(),
    });

    render(
      <IfSuperAdmin>
        <div>Super Admin Panel</div>
      </IfSuperAdmin>,
      { wrapper: createWrapper() },
    );

    expect(screen.queryByText('Super Admin Panel')).not.toBeInTheDocument();
  });

  it('should render fallback when user is not super admin', () => {
    const mockUsePermissions = vi.mocked(usePermissionsHook.usePermissions);
    mockUsePermissions.mockReturnValue({
      isSuperAdmin: () => false,
      isAdmin: () => true,
      userRoles: [ROLES.ADMIN],
      userPermissions: [],
      hasPermission: vi.fn(),
      hasRole: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      canAccessRoute: vi.fn(),
      getAccessibleMenuItems: vi.fn(),
    });

    render(
      <IfSuperAdmin fallback={<div>Regular Admin</div>}>
        <div>Super Admin Panel</div>
      </IfSuperAdmin>,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('Regular Admin')).toBeInTheDocument();
  });
});
