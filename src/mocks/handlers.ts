import { HttpResponse, http } from 'msw';

import type { LoginForm } from '@/shared/schemas/auth';

export const handlers = [
  // User login
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = (await request.json()) as LoginForm;

    // Mock login validation
    if (username === 'admin' && password === 'admin123') {
      return HttpResponse.json({
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 1,
          name: 'Admin User',
          username: 'admin',
          roles: ['admin'],
          permissions: ['user.view', 'user.create', 'user.update', 'user.delete'],
          avatar: '/avatar-admin.png',
        },
      });
    }

    return HttpResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  }),
];
