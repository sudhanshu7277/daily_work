import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/gab/ui/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Keeps it accessible in your VDI environment
    proxy: {
      '/api': {
        // Your deployed corporate backend cloud target
        target: 'https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net',
        changeOrigin: true,
        secure: false,
        // Properly strips the local '/api' prefix and maps directly to the backend root
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})