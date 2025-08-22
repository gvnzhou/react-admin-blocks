import { HttpResponse, http } from 'msw';

import type {
  CreateUserForm,
  UpdateUserForm,
  User,
  UserListResponse,
  UserSearchParams,
} from '@/features/user-management';
import type { LoginForm } from '@/shared/schemas/auth';

// Mock user data
let mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    name: 'Administrator',
    roles: ['admin'],
    status: 'active',
    department: 'engineering',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    avatar: '/avatar-admin.png',
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@example.com',
    name: 'John Manager',
    roles: ['manager'],
    status: 'active',
    department: 'marketing',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    username: 'user1',
    email: 'user1@example.com',
    name: 'Alice Smith',
    roles: ['user'],
    status: 'active',
    department: 'sales',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 4,
    username: 'user2',
    email: 'user2@example.com',
    name: 'Bob Johnson',
    roles: ['user'],
    status: 'inactive',
    department: 'hr',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  },
  {
    id: 5,
    username: 'suspended_user',
    email: 'suspended@example.com',
    name: 'Charlie Brown',
    roles: ['user'],
    status: 'suspended',
    department: 'engineering',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
];

let nextUserId = 6;

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
          permissions: ['user:view', 'user:create', 'user:edit', 'user:delete'],
          avatar: '/avatar-admin.png',
        },
      });
    }

    return HttpResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  }),

  // Get users with search/filter
  http.get('/api/users', async ({ request }) => {
    const url = new URL(request.url);
    const params: UserSearchParams = {
      keyword: url.searchParams.get('keyword') || undefined,
      status: url.searchParams.get('status') || undefined,
      role: url.searchParams.get('role') || undefined,
      department: url.searchParams.get('department') || undefined,
      page: Number(url.searchParams.get('page')) || 1,
      limit: Number(url.searchParams.get('limit')) || 10,
    };

    // Filter users based on search params
    let filteredUsers = mockUsers;

    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(keyword) ||
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword),
      );
    }

    if (params.status) {
      filteredUsers = filteredUsers.filter((user) => user.status === params.status);
    }

    if (params.role) {
      filteredUsers = filteredUsers.filter((user) => user.roles.includes(params.role!));
    }

    if (params.department) {
      filteredUsers = filteredUsers.filter((user) => user.department === params.department);
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const response: UserListResponse = {
      data: paginatedUsers,
      total: filteredUsers.length,
      page: page,
      limit: limit,
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return HttpResponse.json(response);
  }),

  // Get single user
  http.get('/api/users/:id', async ({ params }) => {
    const userId = Number(params.id);
    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json(user);
  }),

  // Create user
  http.post('/api/users', async ({ request }) => {
    const userData = (await request.json()) as CreateUserForm;

    // Check if username or email already exists
    const existingUser = mockUsers.find(
      (u) => u.username === userData.username || u.email === userData.email,
    );

    if (existingUser) {
      return HttpResponse.json({ message: 'Username or email already exists' }, { status: 400 });
    }

    const newUser: User = {
      id: nextUserId++,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json(newUser, { status: 201 });
  }),

  // Update user
  http.put('/api/users/:id', async ({ params, request }) => {
    const userId = Number(params.id);
    const updateData = (await request.json()) as Partial<UpdateUserForm>;

    const userIndex = mockUsers.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check for username/email conflicts
    if (updateData.username || updateData.email) {
      const conflictUser = mockUsers.find(
        (u) =>
          u.id !== userId && (u.username === updateData.username || u.email === updateData.email),
      );

      if (conflictUser) {
        return HttpResponse.json({ message: 'Username or email already exists' }, { status: 400 });
      }
    }

    const updatedUser: User = {
      ...mockUsers[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    mockUsers[userIndex] = updatedUser;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json(updatedUser);
  }),

  // Delete user
  http.delete('/api/users/:id', async ({ params }) => {
    const userId = Number(params.id);
    const userIndex = mockUsers.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    mockUsers.splice(userIndex, 1);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return HttpResponse.json(null, { status: 204 });
  }),

  // Batch delete users
  http.delete('/api/users/batch', async ({ request }) => {
    const { ids } = (await request.json()) as { ids: number[] };

    mockUsers = mockUsers.filter((user) => !ids.includes(user.id));

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json(null, { status: 204 });
  }),

  // Duplicate user
  http.post('/api/users/:id/duplicate', async ({ params }) => {
    const userId = Number(params.id);
    const originalUser = mockUsers.find((u) => u.id === userId);

    if (!originalUser) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const duplicatedUser: User = {
      ...originalUser,
      id: nextUserId++,
      username: `${originalUser.username}_copy_${Date.now()}`,
      email: `copy_${Date.now()}_${originalUser.email}`,
      name: `${originalUser.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(duplicatedUser);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json(duplicatedUser, { status: 201 });
  }),
];
