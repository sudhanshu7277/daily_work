// VERSION THAT MAY FIX THE API CALLS

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
      '/api': {
        target: 'https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/gab/api/api')
      }
    }
  }
})






// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path'

// export default defineConfig({
//   base: '/gab/ui/',
//   plugins: [react()],
  
//   // 1. RESTORE THESE BLOCKS: Fixes the 1900+ destructuring build errors
//   build: { target: 'esnext' },
//   optimizeDeps: {
//     esbuildOptions: { target: 'esnext' }
//   },
  
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//     },
//   },
//   server: {
//     port: 3000,
//     host: '0.0.0.0', // Keeps it accessible in your VDI environment
//     proxy: {
//       '/api': {
//         // Your deployed corporate backend cloud target
//         target: 'https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net',
//         changeOrigin: true,
//         secure: false,
//         // Properly strips the local '/api' prefix and maps directly to the backend root
//         rewrite: (path) => path.replace(/^\/api/, '')
//       }
//     }
//   }
// })