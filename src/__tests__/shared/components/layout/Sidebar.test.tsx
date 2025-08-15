import { fireEvent, render, screen } from '@testing-library/react';
import { Home, Settings, Users } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Sidebar from '@/shared/components/layout/Sidebar';

describe('Sidebar', () => {
  const mockNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const defaultProps = {
    navigation: mockNavigation,
    activePath: '/dashboard',
    onNavigate: vi.fn(),
    onLogout: vi.fn(),
    sidebarOpen: false,
    onCloseSidebar: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render navigation items', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    render(<Sidebar {...defaultProps} />);

    const activeItem = screen.getByText('Dashboard').closest('button');
    expect(activeItem).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('should call onNavigate when navigation item is clicked', () => {
    render(<Sidebar {...defaultProps} />);

    const usersButton = screen.getByText('Users').closest('button');
    fireEvent.click(usersButton!);

    expect(defaultProps.onNavigate).toHaveBeenCalledWith('/users');
  });

  it('should render logout button and handle click', () => {
    render(<Sidebar {...defaultProps} />);

    const logoutButton = screen.getByText('Logout').closest('button');
    expect(logoutButton).toBeInTheDocument();

    fireEvent.click(logoutButton!);
    expect(defaultProps.onLogout).toHaveBeenCalledOnce();
  });

  it('should render admin logo and title', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should render close button when sidebar is open', () => {
    render(<Sidebar {...defaultProps} sidebarOpen={true} />);

    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find(
      (button) =>
        button.classList.contains('lg:hidden') && !button.textContent?.includes('Dashboard'),
    );
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton!);
    expect(defaultProps.onCloseSidebar).toHaveBeenCalledOnce();
  });

  it('should show mobile overlay when sidebar is open', () => {
    const { container } = render(<Sidebar {...defaultProps} sidebarOpen={true} />);

    const overlay = container.querySelector('.fixed.inset-0.bg-black\\/50');
    expect(overlay).toBeInTheDocument();
  });

  it('should close sidebar when overlay is clicked', () => {
    const { container } = render(<Sidebar {...defaultProps} sidebarOpen={true} />);

    const overlay = container.querySelector('.fixed.inset-0.bg-black\\/50');
    expect(overlay).toBeInTheDocument();

    fireEvent.click(overlay!);
    expect(defaultProps.onCloseSidebar).toHaveBeenCalledOnce();
  });

  it('should not show overlay when sidebar is closed', () => {
    const { container } = render(<Sidebar {...defaultProps} sidebarOpen={false} />);

    const overlay = container.querySelector('.fixed.inset-0.bg-black\\/50');
    expect(overlay).not.toBeInTheDocument();
  });

  it('should apply correct transform classes based on sidebar state', () => {
    const { container, rerender } = render(<Sidebar {...defaultProps} sidebarOpen={false} />);

    let sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('-translate-x-full');

    rerender(<Sidebar {...defaultProps} sidebarOpen={true} />);
    sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('translate-x-0');
  });
});
