import * as React from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

import type { User } from '../types';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onConfirm: () => void;
  loading?: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onOpenChange,
  users,
  onConfirm,
  loading = false,
}) => {
  const isMultiple = users.length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            {isMultiple
              ? `Are you sure you want to delete ${users.length} selected users?`
              : `Are you sure you want to delete user "${users[0]?.name || users[0]?.username}"?`}
          </DialogDescription>
        </DialogHeader>

        {users.length > 0 && (
          <div className="max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2 text-sm">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-muted-foreground">({user.username})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
