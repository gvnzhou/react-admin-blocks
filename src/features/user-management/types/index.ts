export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  roles: string[];
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserForm {
  username: string;
  email: string;
  name: string;
  roles: string[];
  department?: string;
  status: 'active' | 'inactive';
}

export interface UpdateUserForm extends Partial<CreateUserForm> {
  id: number;
}

export interface UserSearchParams {
  keyword?: string;
  status?: string;
  role?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}
