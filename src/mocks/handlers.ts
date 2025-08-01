import { http, HttpResponse } from 'msw';

export const handlers = [
  // User login
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = (await request.json()) as any;

    // Mock login validation
    if (username === 'admin' && password === 'admin123') {
      return HttpResponse.json({
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 1,
          name: 'Admin User',
          username: 'admin',
          role: 'admin',
          avatar: '/avatar-admin.png',
        },
      });
    }

    return HttpResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  }),

  // Get user profile
  http.get('/api/user/profile', () => {
    return HttpResponse.json({
      id: 1,
      name: 'Admin User',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      avatar: '/avatar-admin.png',
    });
  }),

  // User list (with pagination)
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const users = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 3 === 0 ? 'admin' : 'user',
      status: i % 4 === 0 ? 'inactive' : 'active',
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    }));

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = users.slice(start, end);

    return HttpResponse.json({
      data: paginatedUsers,
      pagination: {
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit),
      },
    });
  }),

  // Create user
  http.post('/api/users', async ({ request }) => {
    const userData = (await request.json()) as any;
    return HttpResponse.json({
      success: true,
      data: {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString(),
      },
    });
  }),

  // Update user
  http.put('/api/users/:id', async ({ params, request }) => {
    const userData = (await request.json()) as any;
    return HttpResponse.json({
      success: true,
      data: {
        id: parseInt(params.id as string),
        ...userData,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Delete user
  http.delete('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: `User ${params.id} deleted successfully`,
    });
  }),

  // Dashboard statistics
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json({
      totalUsers: 1245,
      activeUsers: 892,
      totalRevenue: 125670,
      growth: 12.5,
    });
  }),
];
