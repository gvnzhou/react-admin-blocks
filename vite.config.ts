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
      include: [
        'src/utils/**',
        'src/services/**',
        'src/shared/hooks/**',
        'src/shared/schemas/**',
        'src/store/**',
        'src/features/**',
        'src/shared/components/**/!(ui)/**',
      ],
      exclude: [
        'src/types/**',
        'src/shared/components/ui/**',
        'src/router/**',
        'src/styles/**',
        'src/mocks/**',
        'src/__tests__/**',
        '**/*.d.ts',
        '**/index.ts',
      ],
    },
  },
});
