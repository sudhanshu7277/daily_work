import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: { target: 'esnext' },
  optimizeDeps: {
    esbuildOptions: { target: 'esnext' }
  },
  base: '/gab/ui/',
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      // This catches any fetch starting with '/api' in your code
      '/api': {
        target: 'https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net',
        changeOrigin: true,
        secure: false,
        // This expands /api/v1/... into /gab/api/api/v1/...
        rewrite: (path) => path.replace(/^\/api/, '/gab/api/api')
      }
    }
  }
})