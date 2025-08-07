# React Admin Blocks 🚀

A modular collection of reusable React features for building enterprise-grade admin systems, styled with shadcn/ui for a modern, minimal, and customizable UI experience.
Built with modern tools and engineering practices to speed up development of internal dashboards and management tools.

## 🌟 Features

- 🔐 **Advanced Permission System**
  - Role-Based Access Control (RBAC) + Permission-Based Access Control (PBAC)
  - Route-level and Component-level Guards
  - Config-driven Route Generation with Automatic Access Control
  - Flexible Permission Hooks for Custom Logic
- 📋 Reusable Table with Pagination, Sorting, Filtering
- 🧾 Dynamic Forms with Validation and Custom Components
- 📦 Modular Feature Structure for Easy Expansion
- 📊 Chart Demos using AntV G2 / ECharts
- ✅ Type-safe Codebase using TypeScript
- 🎭 Mock API with MSW (No Backend Required)
- 🎯 Designed for Real-world Admin Systems

## 📦 Getting Started

```bash
pnpm install
pnpm dev
```

## 🛠️ Tech Stack

- React 19 + Vite + TypeScript
- React Router 7
- Tailwind CSS + shadcn/ui
- Redux Toolkit
- TanStack Query (React Query)
- Mock Service Worker (MSW)
- React Hook Form + Zod
- GitHub Actions (CI-ready)

## 🎭 Mock API

This project uses **Mock Service Worker (MSW)** to provide a complete backend experience without requiring a real server. All API interactions are intercepted and mocked, including:

- User authentication and authorization
- CRUD operations for user management
- Dashboard statistics and data
- Form submissions and validation

The mock API runs in all environments (development and production), making this project a fully functional demo that can be deployed anywhere without backend dependencies.

## 🔐 Permission System

### **Two-Layer Access Control Architecture**

#### **1️⃣ Route-level Guards (`RouteGuard`)**

Protects entire pages and handles redirections:

```typescript
// Automatic route protection via config
{
  path: '/users',
  element: UserListPage,
  requireAuth: true,
  permissions: [Permission.USER_VIEW],
  roles: [Role.ADMIN],
}

// Manual route guard usage
<RouteGuard requireAuth permissions={[Permission.USER_VIEW]}>
  <UserListPage />
</RouteGuard>
```

#### **2️⃣ Component-level Guards (`ComponentGuard`)**

Controls UI element visibility within pages:

```typescript
// Hide/show buttons based on permissions
<IfPermission permissions={[Permission.USER_CREATE]}>
  <Button>Create User</Button>
</IfPermission>

// Role-based UI control
<IfAdmin>
  <AdminToolsPanel />
</IfAdmin>

// Flexible component guard
<ComponentGuard
  roles={[Role.MANAGER]}
  permissions={[Permission.USER_EDIT]}
  requireAllPermissions
>
  <EditButton />
</ComponentGuard>
```

### **Config-driven Route System**

All routes, permissions, and roles are centrally managed in `src/router/permissionConfig.ts`:

```typescript
export const Permission = {
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  // ... more permissions
} as const;

export const Role = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

export const permissionRoutes = [
  {
    path: '/dashboard',
    element: DashboardPage,
    requireAuth: true,
    menuTitle: 'Dashboard',
  },
  {
    path: '/users',
    element: UserListPage,
    requireAuth: true,
    permissions: [Permission.USER_VIEW],
    roles: [Role.ADMIN, Role.MANAGER],
    menuTitle: 'User Management',
  },
  // ... more routes
];
```

### **Permission Hooks**

```typescript
// Check permissions in components
const { hasPermission, hasRole, userRoles, userPermissions } = usePermissions();

// Authentication status
const { isAuthenticated, isLoading } = useAuthStatus();

// Component-level permission checking
const canEdit = usePermissionCheck([Permission.USER_EDIT], [Role.ADMIN]);
```

## 📁 Directory Structure Design

This project adopts a **hybrid architecture** that combines the benefits of both feature-based and type-based organization:

- **`features/`** - Future home for self-contained business modules
- **`shared/`** - Common components and utilities used across features
- **Root-level directories** - Core application structure and global concerns

```plaintext
src/
  ├── assets/           # Static assets (images, SVGs, fonts, etc.)
  ├── features/         # Business modules (self-contained: pages, components, store, api, types)
  │   └── ...           # Feature modules (auth, dashboard, users, etc.)
  ├── shared/           # Shared components and utilities across features
  │   ├── components/   # Reusable UI components
  │   │   ├── layout/   # Layout components (Header, Sidebar, etc.)
  │   │   │   ├── Header.tsx
  │   │   │   └── Sidebar.tsx
  │   │   ├── ui/       # Base shadcn/ui components
  │   │   │   ├── button.tsx
  │   │   │   ├── card.tsx
  │   │   │   └── input.tsx
  │   │   ├── RouteGuard.tsx      # Route-level permission control
  │   │   ├── ComponentGuard.tsx  # Component-level permission control
  │   │   └── index.ts  # Unified component exports
  │   ├── hooks/        # Custom reusable hooks
  │   │   ├── useAuth.ts         # Authentication hooks
  │   │   ├── usePermissions.ts  # Permission checking hooks
  │   │   └── index.ts  # Unified hook exports
  │   ├── schemas/      # Zod validation schemas
  │   │   └── auth.ts
  ├── layouts/          # Layout components (main frame, login layout, etc.)
  │   ├── MainLayout.tsx
  │   └── LoginLayout.tsx
  ├── lib/              # Third-party library configurations and utilities
  ├── mocks/            # MSW mock handlers and browser setup
  │   ├── handlers.ts
  │   └── browser.ts
  ├── pages/            # Route entry pages
  │   ├── DashboardPage.tsx
  │   ├── LoginPage.tsx
  │   ├── NotFoundPage.tsx
  │   └── UserListPage.tsx
  ├── router/           # Route configuration
  │   ├── permissionConfig.ts      # Centralized route & permission config
  │   ├── PermissionRouteGenerator.tsx  # Dynamic route generation
  │   └── index.tsx     # Main router setup
  ├── services/         # API abstraction (fetcher instance, API methods)
  │   ├── fetcher.ts
  │   └── auth.ts
  ├── store/            # Global state management (Redux Toolkit)
  │   ├── userSlice.ts       # User authentication & roles state
  │   ├── uiSlice.ts         # UI state management
  │   └── index.ts           # Store configuration
  ├── styles/           # Global styles (Tailwind CSS configuration)
  │   ├── globals.css
  │   ├── themes.css
  │   └── variables.css
  ├── types/            # Pure TypeScript type definitions
  ├── utils/            # Utility functions
  │   └── cn.ts         # Tailwind class merging utility
  ├── App.tsx           # App entry component
  ├── main.tsx          # Application render entry point
  └── vite-env.d.ts     # Vite environment type definitions
```

## 🚧 Blocks (Features)

| Module                  | Status | Description                                               |
| ----------------------- | ------ | --------------------------------------------------------- |
| 🔐 **Auth & RBAC**      | ✅     | Complete authentication + advanced permission system      |
| 🛡️ **Route Guards**     | ✅     | Config-driven route protection & automatic access control |
| 🧩 **Permission Hooks** | ✅     | Flexible permission checking for components               |
| 👥 User Management      | 🔄     | User CRUD with permission-controlled UI                   |
| 📊 Charts Dashboard     | 🔄     | Role-based dashboard with different views                 |
| 📝 Dynamic Forms        | 🔄     | Permission-aware form fields and actions                  |
| 📁 File Upload          | 🔄     | Role-based file operations                                |
