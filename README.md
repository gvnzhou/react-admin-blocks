# React Admin Blocks 🚀

A modular collection of reusable React features for building enterprise-grade admin systems, styled with shadcn/ui for a modern, minimal, and customizable UI experience.
Built with modern tools and engineering practices to speed up development of internal dashboards and management tools.

## 🌟 Features

- 🔐 Authentication and Role-based Access Control
- 📋 Reusable Table with Pagination, Sorting, Filtering
- 🧾 Dynamic Forms with Validation and Custom Components
- 📦 Modular Feature Structure for Easy Expansion
- 📊 Chart Demos using AntV G2 / ECharts
- 🌍 i18n Internationalization Support
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
  │   │   ├── auth/     # Authentication components
  │   │   ├── layout/   # Layout components (Header, Sidebar, etc.)
  │   │   └── ui/       # Base UI components (Button, Modal, Table, etc.)
  │   ├── hooks/        # Custom reusable hooks
  │   ├── schemas/      # Zod validation schemas with auto-generated TypeScript types
  │   └── locales/      # i18n resources
  ├── layouts/          # Layout components (main frame, login layout, etc.)
  ├── lib/              # Third-party library configurations and utilities
  ├── mocks/            # MSW mock handlers and browser setup
  ├── pages/            # Route entry pages (aggregating feature pages)
  ├── router/           # Route configuration
  ├── services/         # API abstraction (fetcher instance, API methods)
  ├── store/            # Global state management (Redux Toolkit)
  ├── styles/           # Global styles (Tailwind CSS configuration)
  ├── types/            # Pure TypeScript type definitions
  ├── utils/            # Utility functions
  ├── App.tsx           # App entry component
  ├── main.tsx          # Application render entry point
  └── vite-env.d.ts     # Vite environment type definitions
```

## 🚧 Blocks (Features)

| Module              | Status |
| ------------------- | ------ |
| 🔐 Auth & RBAC      | 🔄     |
| 👥 User Management  | 🔄     |
| 📊 Charts Dashboard | 🔄     |
| 📝 Dynamic Forms    | 🔄     |
| 📁 File Upload      | 🔄     |
| 🌍 i18n Support     | 🔄     |
