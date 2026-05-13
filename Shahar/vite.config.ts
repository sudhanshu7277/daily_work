import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // 1. Force the compiler to allow modern JS (Fixes the 1214 errors)
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // 2. Add 'host' to help the VDI resolve the local address
    host: '0.0.0.0', 
    proxy: {
      '/api': {
        target: '[https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net](https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net)',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/gab/api')
      }
    }
  }
})

rm -rf node_modules/.vite

npm run dev