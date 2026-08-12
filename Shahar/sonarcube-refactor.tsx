// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit


// Fix: Update vite.config.ts

/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/nextgengab/ui',
  plugins: [react()],
  esbuild: {
    target: 'esnext',
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/nextgengab/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setupMocks.ts'],
    css: false,
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
});

// run build
npm run build


// Commit and push:
git add vite.config.ts
git commit -m "add esnext target to vite config IS-71990"
git push