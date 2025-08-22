import * as React from 'react';

import { ComponentGuard } from '@/shared/components';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PERMISSIONS } from '@/shared/constants';

import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import UserDialog from '../components/UserDialog';
import UserSearchBar from '../components/UserSearchBar';
import UserTable from '../components/UserTable';
import {
  useCreateUser,
  useDeleteUser,
  useDeleteUsers,
  useDuplicateUser,
  useUpdateUser,
  useUsers,
} from '../hooks/useUsers';
import type { CreateUserForm, UpdateUserForm, User, UserSearchParams } from '../types';

const UserListPage = () => {
  // State
  const [searchParams, setSearchParams] = React.useState<UserSearchParams>({
    page: 1,
    limit: 10,
  });
  const [selectedUsers, setSelectedUsers] = React.useState<number[]>([]);
  const [dialogState, setDialogState] = React.useState<{
    type: 'create' | 'edit' | null;
    user?: User | null;
    open: boolean;
  }>({
    type: null,
    user: null,
    open: false,
  });
  const [deleteDialogState, setDeleteDialogState] = React.useState<{
    users: User[];
    open: boolean;
  }>({
    users: [],
    open: false,
  });

  // Queries and mutations
  const { data: usersResponse, isLoading: isLoadingUsers } = useUsers(searchParams);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const deleteUsers = useDeleteUsers();
  const duplicateUser = useDuplicateUser();

  const users = usersResponse?.data || [];
  const total = usersResponse?.total || 0;

  // Event handlers
  const handleSearchChange = (newParams: UserSearchParams) => {
    setSearchParams(newParams);
    setSelectedUsers([]); // Clear selection when searching
  };

  const handleSearchReset = () => {
    setSearchParams({
      page: 1,
      limit: 10,
    });
    setSelectedUsers([]);
  };

  const handleSelectUser = (userId: number, selected: boolean) => {
    setSelectedUsers((prev) => (selected ? [...prev, userId] : prev.filter((id) => id !== userId)));
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedUsers(selected ? users.map((user) => user.id) : []);
  };

  const handleCreate = () => {
    setDialogState({
      type: 'create',
      user: null,
      open: true,
    });
  };

  const handleEdit = (user: User) => {
    setDialogState({
      type: 'edit',
      user,
      open: true,
    });
  };

  const handleDelete = (user: User) => {
    setDeleteDialogState({
      users: [user],
      open: true,
    });
  };

  const handleBatchDelete = () => {
    const usersToDelete = users.filter((user) => selectedUsers.includes(user.id));
    setDeleteDialogState({
      users: usersToDelete,
      open: true,
    });
  };

  const handleDuplicate = async (user: User) => {
    try {
      await duplicateUser.mutateAsync(user.id);
      // Success message could be shown here
    } catch (error) {
      console.error('Failed to duplicate user:', error);
      // Error message could be shown here
    }
  };

  const handleDialogSubmit = async (data: CreateUserForm | UpdateUserForm) => {
    try {
      if (dialogState.type === 'create') {
        await createUser.mutateAsync(data as CreateUserForm);
      } else if (dialogState.type === 'edit') {
        await updateUser.mutateAsync(data as UpdateUserForm);
      }
      setDialogState({ type: null, user: null, open: false });
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to save user:', error);
      // Error message could be shown here
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const userIds = deleteDialogState.users.map((user) => user.id);

      if (userIds.length === 1) {
        await deleteUser.mutateAsync(userIds[0]);
      } else {
        await deleteUsers.mutateAsync(userIds);
      }

      setDeleteDialogState({ users: [], open: false });
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to delete users:', error);
      // Error message could be shown here
    }
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
    setSelectedUsers([]);
  };

  // Loading states
  const isSubmitting = createUser.isPending || updateUser.isPending;
  const isDeleting = deleteUser.isPending || deleteUsers.isPending;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users</p>
        </div>

        <div className="flex items-center gap-2">
          {selectedUsers.length > 0 && (
            <ComponentGuard permissions={[PERMISSIONS.USER_DELETE]}>
              <Button variant="destructive" onClick={handleBatchDelete}>
                Batch Delete ({selectedUsers.length})
              </Button>
            </ComponentGuard>
          )}

          <ComponentGuard permissions={[PERMISSIONS.USER_CREATE]}>
            <Button onClick={handleCreate}>Add User</Button>
          </ComponentGuard>
        </div>
      </div>

      {/* Search Bar */}
      <UserSearchBar
        searchParams={searchParams}
        onSearchChange={handleSearchChange}
        onReset={handleSearchReset}
      />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            User List
            {total > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {total} records total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            loading={isLoadingUsers}
          />

          {/* Pagination */}
          {total > (searchParams.limit || 10) && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((searchParams.page || 1) - 1) * (searchParams.limit || 10) + 1} to{' '}
                {Math.min((searchParams.page || 1) * (searchParams.limit || 10), total)} of {total}{' '}
                records
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((searchParams.page || 1) - 1)}
                  disabled={(searchParams.page || 1) <= 1}
                >
                  Previous
                </Button>

                <span className="text-sm">
                  Page {searchParams.page || 1} of {Math.ceil(total / (searchParams.limit || 10))}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((searchParams.page || 1) + 1)}
                  disabled={
                    (searchParams.page || 1) >= Math.ceil(total / (searchParams.limit || 10))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Dialog */}
      <UserDialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState({ type: null, user: null, open: false });
          }
        }}
        user={dialogState.user}
        onSubmit={handleDialogSubmit}
        loading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogState.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogState({ users: [], open: false });
          }
        }}
        users={deleteDialogState.users}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
};

export default UserListPage;
