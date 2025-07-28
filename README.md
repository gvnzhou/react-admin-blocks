# React Admin Blocks 🚀

A modular collection of reusable React features for building enterprise-grade admin systems.  
Built with modern tools and engineering practices to speed up development of internal dashboards and management tools.

## 🌟 Features

- 🔐 Authentication and Role-based Access Control
- 📋 Reusable Table with Pagination, Sorting, Filtering
- 🧾 Dynamic Forms with Validation and Custom Components
- 📦 Modular Feature Structure for Easy Expansion
- 📊 Chart Demos using AntV G2 / ECharts
- 🌍 i18n Internationalization Support
- ✅ Type-safe Codebase using TypeScript
- 🎯 Designed for Real-world Admin Systems

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
  ├── pages/            # Route entry pages (aggregating feature pages)
  ├── router/           # Route configuration
  ├── store/            # Global state management (Zustand/Redux)
  ├── utils/            # Utility functions
  ├── services/         # API abstraction (axios instance, API methods)
  ├── locales/          # i18n resources
  ├── styles/           # Global styles (Tailwind config, global CSS/SCSS)
  ├── App.tsx           # App entry
  ├── main.tsx          # Render entry
  └── vite-env.d.ts     # Vite environment types
```

## 🛠️ Tech Stack

- React 19 + Vite + TypeScript
- Zustand (or Redux Toolkit)
- React Router 6
- Tailwind CSS / shadcn/ui
- React Hook Form + Zod
- Axios + API abstraction
- GitHub Actions (CI-ready)

## 🚧 Blocks (Features)

| Module              | Status |
| ------------------- | ------ |
| 🔐 Auth & RBAC      | ✅     |
| 👥 User Management  | ✅     |
| 📊 Charts Dashboard | 🔄     |
| 📝 Dynamic Forms    | ✅     |
| 📁 File Upload      | 🔄     |
| 🌍 i18n Support     | ✅     |

## 📦 Getting Started

```bash
pnpm install
pnpm dev
```
