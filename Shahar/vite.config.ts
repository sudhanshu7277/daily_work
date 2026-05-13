import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/gab/ui/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020'
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/gab/api'),
      },
    },
  },
});