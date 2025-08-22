import type {
  CreateUserForm,
  UpdateUserForm,
  User,
  UserListResponse,
  UserSearchParams,
} from '../types';

const API_BASE = '/api/users';

export const userService = {
  // 获取用户列表
  async getUsers(params: UserSearchParams = {}): Promise<UserListResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const url = searchParams.toString() ? `${API_BASE}?${searchParams}` : API_BASE;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  // 获取单个用户
  async getUser(id: number): Promise<User> {
    const response = await fetch(`${API_BASE}/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  },

  // 创建用户
  async createUser(data: CreateUserForm): Promise<User> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    return response.json();
  },

  // 更新用户
  async updateUser(data: UpdateUserForm): Promise<User> {
    const response = await fetch(`${API_BASE}/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    return response.json();
  },

  // 删除用户
  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  },

  // 批量删除用户
  async deleteUsers(ids: number[]): Promise<void> {
    const response = await fetch(`${API_BASE}/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete users');
    }
  },

  // 复制用户
  async duplicateUser(id: number): Promise<User> {
    const response = await fetch(`${API_BASE}/${id}/duplicate`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to duplicate user');
    }

    return response.json();
  },
};
