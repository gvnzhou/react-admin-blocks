// Export user management features
export { default as UserListPage } from './pages/UserListPage';

// Re-export types, hooks, components when they're created
export * from './types';
export * from './hooks/useUsers';
export * from './services/userService';

// Components
export { default as UserSearchBar } from './components/UserSearchBar';
export { default as UserTable } from './components/UserTable';
export { default as UserDialog } from './components/UserDialog';
export { default as DeleteConfirmDialog } from './components/DeleteConfirmDialog';
