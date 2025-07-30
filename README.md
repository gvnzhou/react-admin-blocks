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
- Mock Service Worker (MSW)
- React Hook Form + Zod
- Axios + API abstraction
- GitHub Actions (CI-ready)

## 🎭 Mock API

This project uses **Mock Service Worker (MSW)** to provide a complete backend experience without requiring a real server. All API interactions are intercepted and mocked, including:

- User authentication and authorization
- CRUD operations for user management
- Dashboard statistics and data
- Form submissions and validation

The mock API runs in all environments (development and production), making this project a fully functional demo that can be deployed anywhere without backend dependencies.

## 📁 Directory Structure Design

```plaintext
src/
  ├── assets/           # Static assets (images, SVGs, fonts, etc.)
  ├── components/       # Reusable UI components (Button, Modal, Table, etc.)
  ├── features/         # Business modules (self-contained: pages, components, store, api, types)
  │   ├── auth/
  │   ├── user/
  │   ├── dashboard/
  │   └── ...           # Other modules
  ├── hooks/            # Custom reusable hooks
  ├── layouts/          # Layout components (main frame, login layout, etc.)
  ├── schemas/          # Zod validation schemas with auto-generated TypeScript types
  ├── types/            # Pure TypeScript type definitions
  ├── mocks/            # MSW mock handlers and browser setup
  ├── pages/            # Route entry pages (aggregating feature pages)
  ├── router/           # Route configuration
  ├── store/            # Global state management (Redux Toolkit)
  ├── utils/            # Utility functions
  ├── services/         # API abstraction (axios instance, API methods)
  ├── locales/          # i18n resources
  ├── styles/           # Global styles (Tailwind config, global CSS/SCSS)
  ├── App.tsx           # App entry
  ├── main.tsx          # Render entry
  └── vite-env.d.ts     # Vite environment types
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
