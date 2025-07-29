// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // 用户登录
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = (await request.json()) as any;

    // 模拟登录验证
    if (username === 'admin' && password === 'admin') {
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

  // 获取用户信息
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

  // 用户列表（支持分页）
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

  // 创建用户
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

  // 更新用户
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

  // 删除用户
  http.delete('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: `User ${params.id} deleted successfully`,
    });
  }),

  // Dashboard 统计数据
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json({
      totalUsers: 1245,
      activeUsers: 892,
      totalRevenue: 125670,
      growth: 12.5,
    });
  }),
];
