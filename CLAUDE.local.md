# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `pnpm dev` - Start development server with Vite
- `pnpm build` - Build for production (TypeScript compilation + Vite build)
- `pnpm preview` - Preview production build locally

### Code Quality

- `pnpm lint` - Run ESLint for code linting
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting without making changes
- `pnpm type-check` - Run TypeScript type checking without emitting files

### Testing

- `pnpm test` - Run tests in watch mode with Vitest
- `pnpm test:ui` - Run tests with Vitest UI
- `pnpm test:run` - Run tests once (no watch mode)
- `pnpm test:coverage` - Run tests with coverage report

## Architecture Overview

This is a **React Admin Blocks** project - a modular collection of reusable components for building enterprise admin systems with advanced permission management.

### Key Architectural Components

#### Permission System (Core Feature)

The application uses a sophisticated two-layer access control system:

1. **Route-level Guards** (`RouteGuard`) - Protects entire pages and handles redirections
2. **Component-level Guards** (`ComponentGuard`) - Controls UI element visibility within pages

All permissions and routes are centrally managed in `src/router/permissionConfig.ts` using a config-driven approach.

#### State Management

- **Redux Toolkit** for global state management
- **TanStack Query** for server state and API caching
- Two main slices: `userSlice` (auth/roles) and `uiSlice` (UI state)

#### Mock API

Uses **Mock Service Worker (MSW)** for complete backend simulation. All API interactions are intercepted and mocked, allowing the app to run without a real backend.

### Directory Structure

- **`src/features/`** - Business modules (self-contained: pages, components, store, api, types)
- **`src/shared/`** - Reusable components and utilities across features
  - `shared/components/` - Reusable UI components including permission guards
  - `shared/hooks/` - Custom hooks for auth and permissions
  - `shared/constants/` - Permission and role definitions
- **`src/router/`** - Route configuration with permission-based access control
- **`src/store/`** - Redux store configuration and slices
- **`src/services/`** - API abstraction layer
- **`src/types/`** - TypeScript type definitions for permissions, auth, etc.

### Key Files for Understanding

- `src/router/permissionConfig.ts` - Complete route and permission configuration
- `src/shared/constants/permissions.ts` - Permission and role definitions with mappings
- `src/shared/hooks/usePermissions.ts` - Permission checking logic
- `src/shared/components/RouteGuard.tsx` - Route-level permission enforcement
- `src/shared/components/ComponentGuard.tsx` - Component-level permission enforcement

## Development Guidelines

### Permission System Usage

When working with permissions:

- Use `PERMISSIONS` and `ROLES` constants from `@/shared/constants`
- Route protection is automatic via `permissionConfig.ts`
- For component-level guards, use `ComponentGuard` or `usePermissions` hook
- All new routes should be added to `permissionConfig.ts` with appropriate permissions

### TypeScript Configuration

- Project uses path aliases: `@/*` maps to `./src/*`
- Strict TypeScript configuration with comprehensive type checking
- Permission and role types are strictly typed for type safety

### Testing Strategy

- **Vitest** with jsdom for React component testing
- **@testing-library/react** for component testing utilities
- **@testing-library/user-event** for user interaction testing
- Coverage excludes UI components, types, mocks, and configuration files

### Code Style

- **ESLint** + **Prettier** for consistent code formatting
- **TypeScript ESLint** for TypeScript-specific rules
- Pre-commit hooks enforce linting and formatting via `simple-git-hooks`
- Conventional commits enforced via `commitlint`
- **React 19+** uses new JSX Transform, no need to explicitly import React

### Git Workflow

- Pre-commit: `pnpm exec lint-staged` (runs linting/formatting on staged files)
- Commit message: `pnpm exec commitlint` (validates conventional commit format)
- Commit types: feat, fix, docs, style, refactor, perf, test, chore, revert, build

- commit 不包含 claude code 信息,并且尽可能简短
