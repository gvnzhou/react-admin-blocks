import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MainLayout from '@/layouts/MainLayout';

const mockNavigate = vi.fn();
const mockLogoutMutate = vi.fn();
const mockGetAccessibleMenuItems = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/shared/hooks', () => ({
  useLogout: () => ({ mutate: mockLogoutMutate }),
  usePermissions: () => ({
    getAccessibleMenuItems: mockGetAccessibleMenuItems,
  }),
}));

vi.mock('@/shared/components', () => ({
  Header: ({ title, onOpenSidebar }: { title: string; onOpenSidebar: () => void }) => (
    <header data-testid="header">
      <h1>{title}</h1>
      <button onClick={onOpenSidebar}>Open Sidebar</button>
    </header>
  ),
  Sidebar: ({
    navigation,
    onNavigate,
    onLogout,
    sidebarOpen,
    onCloseSidebar,
  }: {
    navigation: { href: string; name: string }[];
    onNavigate: (href: string) => void;
    onLogout: () => void;
    sidebarOpen: boolean;
    onCloseSidebar: () => void;
  }) => (
    <div data-testid="sidebar" data-open={sidebarOpen}>
      {navigation.map((item: { href: string; name: string }) => (
        <button key={item.href} onClick={() => onNavigate(item.href)}>
          {item.name}
        </button>
      ))}
      <button onClick={onLogout}>Logout</button>
      <button onClick={onCloseSidebar}>Close</button>
    </div>
  ),
}));

vi.mock('@/router/permissionConfig', () => ({
  permissionRoutes: [
    {
      path: '/dashboard',
      menuTitle: 'Dashboard',
      menuIcon: 'dashboard',
      menuOrder: 1,
    },
    {
      path: '/users',
      menuTitle: 'Users',
      menuIcon: 'users',
      menuOrder: 2,
    },
    {
      path: '/settings',
      menuTitle: 'Settings',
      menuIcon: 'settings',
      menuOrder: 3,
      hideInMenu: true,
    },
  ],
}));

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessibleMenuItems.mockReturnValue([
      {
        path: '/dashboard',
        menuTitle: 'Dashboard',
        menuIcon: 'dashboard',
        menuOrder: 1,
      },
      {
        path: '/users',
        menuTitle: 'Users',
        menuIcon: 'users',
        menuOrder: 2,
      },
    ]);
  });

  const renderWithRouter = (initialPath = '/dashboard') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <MainLayout />
      </MemoryRouter>,
    );
  };

  it('should render layout structure correctly', () => {
    renderWithRouter();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should generate navigation from permission config', () => {
    renderWithRouter();

    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Users' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('should handle navigation correctly', () => {
    renderWithRouter();

    const usersButton = screen.getByRole('button', { name: 'Users' });
    fireEvent.click(usersButton);

    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });

  it('should handle sidebar toggle', () => {
    renderWithRouter();

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-open', 'false');

    const openButton = screen.getByText('Open Sidebar');
    fireEvent.click(openButton);

    expect(sidebar).toHaveAttribute('data-open', 'true');

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(sidebar).toHaveAttribute('data-open', 'false');
  });

  it('should handle logout', () => {
    renderWithRouter();

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockLogoutMutate).toHaveBeenCalled();
  });

  it('should close sidebar when navigating', () => {
    renderWithRouter();

    const openButton = screen.getByText('Open Sidebar');
    fireEvent.click(openButton);

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-open', 'true');

    const usersButton = screen.getByRole('button', { name: 'Users' });
    fireEvent.click(usersButton);

    expect(sidebar).toHaveAttribute('data-open', 'false');
  });

  it('should display correct title based on current path', () => {
    mockGetAccessibleMenuItems.mockReturnValue([
      {
        path: '/users',
        menuTitle: 'Users',
        menuIcon: 'users',
        menuOrder: 1,
      },
    ]);

    renderWithRouter('/users');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Users');
  });

  it('should show default title when path not found', () => {
    renderWithRouter('/unknown');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
  });

  it('should filter out hidden menu items', () => {
    mockGetAccessibleMenuItems.mockReturnValue([
      {
        path: '/dashboard',
        menuTitle: 'Dashboard',
        menuIcon: 'dashboard',
        menuOrder: 1,
      },
      {
        path: '/settings',
        menuTitle: 'Settings',
        menuIcon: 'settings',
        menuOrder: 3,
        hideInMenu: true,
      },
    ]);

    renderWithRouter();

    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('should sort navigation items by menuOrder', () => {
    mockGetAccessibleMenuItems.mockReturnValue([
      {
        path: '/users',
        menuTitle: 'Users',
        menuIcon: 'users',
        menuOrder: 2,
      },
      {
        path: '/dashboard',
        menuTitle: 'Dashboard',
        menuIcon: 'dashboard',
        menuOrder: 1,
      },
    ]);

    renderWithRouter();

    const buttons = screen
      .getAllByRole('button')
      .filter((button) => button.textContent === 'Dashboard' || button.textContent === 'Users');

    expect(buttons[0]).toHaveTextContent('Dashboard');
    expect(buttons[1]).toHaveTextContent('Users');
  });
});
