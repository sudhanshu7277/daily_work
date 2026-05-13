import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // 1. Fix the 1214 transformation errors (Terminal)
  build: { target: 'esnext' },
  optimizeDeps: {
    esbuildOptions: { target: 'esnext' }
  },
  // 2. Align with your expected browser path
  base: '/gab/ui/', 
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Helps the VDI resolve the local address
    // 3. Stabilize WebSocket/HMR for VDI
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      '/api': {
        // 4. CLEAN URL (No brackets or markdown)
        target: 'https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net',
        changeOrigin: true,
        secure: false, // Bypass Citi's internal self-signed SSL certificates
        // rewrite: (path) => path.replace(/^\/api/, '/gab/api')
        rewrite: (path) => path.replace(/^\/api\/v1\/gab/, '/gab/api/v1/gab')
      }
    }
  }
})