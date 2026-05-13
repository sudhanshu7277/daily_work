import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 1. Mandatory for esbuild-wasm & icgds-react compatibility
  // Fixes the "Transforming destructuring" (1214) errors
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },

  // 2. Base path to match your VDI browser URL: localhost:5173/gab/ui/
  base: '/gab/ui/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    // 3. Allows the VDI loopback to resolve properly
    host: '0.0.0.0', 
    proxy: {
      // 4. Fixed Proxy: Maps local /api calls to the backend domain
      '/api': {
        target: 'https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net',
        changeOrigin: true,
        secure: false, // Bypass internal Citi self-signed SSL certificates
        // Rewrites /api/... to /gab/api/... to match the backend service
        rewrite: (path) => path.replace(/^\/api/, '/gab/api')
      }
    }
  }
});