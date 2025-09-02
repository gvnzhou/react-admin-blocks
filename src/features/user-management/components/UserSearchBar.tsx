import { useState } from 'react';

import { Check, ChevronDown } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/utils/cn';

import type { UserSearchParams } from '../types';

interface UserSearchBarProps {
  searchParams: UserSearchParams;
  onSearchChange: (params: UserSearchParams) => void;
  onReset: () => void;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({ searchParams, onSearchChange, onReset }) => {
  const [departmentOpen, setDepartmentOpen] = useState(false);

  const departments = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'HR' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' },
    { value: 'design', label: 'Design' },
    { value: 'product', label: 'Product' },
  ];
  const handleInputChange = (field: keyof UserSearchParams, value: string) => {
    onSearchChange({
      ...searchParams,
      [field]: value || undefined,
      page: 1, // Reset to first page when searching
    });
  };

  const handleSelectChange = (field: keyof UserSearchParams, value: string) => {
    const actualValue = value === 'all' ? undefined : value;
    onSearchChange({
      ...searchParams,
      [field]: actualValue,
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
            value={searchParams.status || 'all'}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Role Filter */}
        <div>
          <Select
            value={searchParams.role || 'all'}
            onValueChange={(value) => handleSelectChange('role', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Department Filter */}
        <div>
          <Popover open={departmentOpen} onOpenChange={setDepartmentOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={departmentOpen}
                className="w-full justify-between"
              >
                {searchParams.department
                  ? departments.find((dept) => dept.value === searchParams.department)?.label
                  : 'All Departments'}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search departments..." />
                <CommandList>
                  <CommandEmpty>No department found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        handleSelectChange('department', 'all');
                        setDepartmentOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          !searchParams.department ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      All Departments
                    </CommandItem>
                    {departments.map((department) => (
                      <CommandItem
                        key={department.value}
                        value={department.value}
                        onSelect={(currentValue) => {
                          handleSelectChange('department', currentValue);
                          setDepartmentOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            searchParams.department === department.value
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {department.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
