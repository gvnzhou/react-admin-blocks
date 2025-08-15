import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Header from '@/shared/components/layout/Header';

describe('Header', () => {
  const defaultProps = {
    title: 'Dashboard',
    onOpenSidebar: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title correctly', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
  });

  it('should render mobile menu button and trigger callback', () => {
    render(<Header {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    const menuButton = buttons.find((button) => button.classList.contains('lg:hidden'));

    expect(menuButton).toBeInTheDocument();
    fireEvent.click(menuButton!);
    expect(defaultProps.onOpenSidebar).toHaveBeenCalledOnce();
  });

  it('should render search button', () => {
    render(<Header {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    const searchButton = buttons.find(
      (button) =>
        button.classList.contains('text-muted-foreground') &&
        !button.classList.contains('lg:hidden'),
    );

    expect(searchButton).toBeInTheDocument();
  });

  it('should render user avatar with correct initial', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should have correct header structure and styling', () => {
    const { container } = render(<Header {...defaultProps} />);

    const header = container.querySelector('header');
    expect(header).toHaveClass(
      'flex',
      'h-16',
      'items-center',
      'gap-4',
      'border-b',
      'border-border',
      'bg-card',
      'px-6',
    );
  });
});
