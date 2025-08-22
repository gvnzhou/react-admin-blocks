import * as React from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';

import type { UserSearchParams } from '../types';

interface UserSearchBarProps {
  searchParams: UserSearchParams;
  onSearchChange: (params: UserSearchParams) => void;
  onReset: () => void;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({ searchParams, onSearchChange, onReset }) => {
  const handleInputChange = (field: keyof UserSearchParams, value: string) => {
    onSearchChange({
      ...searchParams,
      [field]: value || undefined,
      page: 1, // Reset to first page when searching
    });
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Keyword Search */}
        <div>
          <Input
            placeholder="Search username or email..."
            value={searchParams.keyword || ''}
            onChange={(e) => handleInputChange('keyword', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Status Filter */}
        <div>
          <Select
            value={searchParams.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </Select>
        </div>

        {/* Role Filter */}
        <div>
          <Select
            value={searchParams.role || ''}
            onChange={(e) => handleInputChange('role', e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </Select>
        </div>

        {/* Department Filter */}
        <div>
          <Select
            value={searchParams.department || ''}
            onChange={(e) => handleInputChange('department', e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
            <option value="hr">HR</option>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button onClick={() => onSearchChange({ ...searchParams, page: 1 })}>Search</Button>
      </div>
    </div>
  );
};

export default UserSearchBar;
