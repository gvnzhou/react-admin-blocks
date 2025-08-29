import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import UserListPage from '@/features/user-management/pages/UserListPage';

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => <BrowserRouter>{children}</BrowserRouter>;
};

describe('UserListPage', () => {
  it('should render correctly', () => {
    const wrapper = createWrapper();
    const { container } = render(<UserListPage />, { wrapper });

    // 测试快照，确保UI结构不被意外改变
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should have accessible heading with correct styling', () => {
    const wrapper = createWrapper();
    render(<UserListPage />, { wrapper });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'mb-4');
    expect(heading).toHaveTextContent('User List');
  });
});
