import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { userService } from '../services/userService';
import type { CreateUserForm, UpdateUserForm, UserSearchParams } from '../types';

const QUERY_KEYS = {
  users: ['users'] as const,
  user: (id: number) => ['users', id] as const,
} as const;

export function useUsers(params: UserSearchParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.users, params],
    queryFn: () => userService.getUsers(params),
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserForm) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserForm) => userService.updateUser(data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      queryClient.setQueryData(QUERY_KEYS.user(updatedUser.id), updatedUser);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
}

export function useDeleteUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => userService.deleteUsers(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
}

export function useDuplicateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.duplicateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
}
