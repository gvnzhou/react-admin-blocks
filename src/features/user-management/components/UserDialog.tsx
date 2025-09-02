import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';

import type { CreateUserForm, UpdateUserForm, User } from '../types';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  dialogType?: 'create' | 'edit' | 'copy';
  onSubmit: (data: CreateUserForm | UpdateUserForm) => void;
  loading?: boolean;
}

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'User' },
];

const DEPARTMENTS = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'hr', label: 'HR' },
];

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onOpenChange,
  user,
  dialogType = 'create',
  onSubmit,
  loading = false,
}) => {
  const isEdit = dialogType === 'edit';
  const isCopy = dialogType === 'copy';

  const [formData, setFormData] = useState<CreateUserForm>({
    username: '',
    email: '',
    name: '',
    roles: [],
    department: '',
    status: 'active',
  });

  // Initialize form data when dialog opens or user changes
  useEffect(() => {
    if (user && (isEdit || isCopy)) {
      setFormData({
        username: isCopy ? `${user.username}_copy` : user.username,
        email: isCopy ? `copy_${user.email}` : user.email,
        name: isCopy ? `${user.name} (Copy)` : user.name,
        roles: user.roles,
        department: user.department || '',
        status: user.status,
      });
    } else {
      setFormData({
        username: '',
        email: '',
        name: '',
        roles: [],
        department: '',
        status: 'active',
      });
    }
  }, [user, isEdit, isCopy, open]);

  const handleInputChange = (field: keyof CreateUserForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      roles: checked ? [...prev.roles, role] : prev.roles.filter((r) => r !== role),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && user) {
      onSubmit({
        id: user.id,
        ...formData,
      } as UpdateUserForm);
    } else {
      onSubmit(formData);
    }
  };

  const isValid =
    formData.username.trim() &&
    formData.email.trim() &&
    formData.name.trim() &&
    formData.roles.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : isCopy ? 'Copy User' : 'Create User'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modify user information'
              : isCopy
                ? 'Create a new user based on existing data'
                : 'Fill in user details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Roles</label>
            <div className="space-y-2">
              {AVAILABLE_ROLES.map((role) => (
                <div key={role.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={role.value}
                    checked={formData.roles.includes(role.value)}
                    onChange={(checked) => handleRoleChange(role.value, checked as boolean)}
                  />
                  <label htmlFor={role.value} className="text-sm">
                    {role.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={formData.status}
              onChange={(e) =>
                handleInputChange('status', e.target.value as 'active' | 'inactive' | 'suspended')
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Select
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? 'Saving...' : isEdit ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
