/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    coverage: {
      include: ['src/**/*'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx,js,jsx}',
        'src/**/*.spec.{ts,tsx,js,jsx}',
        'src/__tests__/**',
        'src/types/**',
        'src/shared/components/ui/**',
        'src/router/index.tsx',
        'src/router/permissionConfig.ts',
        'src/styles/**',
        'src/mocks/**',
        'src/main.tsx',
        'src/App.tsx',
        'src/vite-env.d.ts',
        '**/index.{ts,tsx,js,jsx}',
      ],
    },
  },
});
