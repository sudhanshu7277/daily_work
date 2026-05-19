//LATEST VITE CONFIG FOR VDI ENVIRONMENT


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
    // No HMR host overrides here, keeping it local
    proxy: {
      '/gab/api': {
        target: 'https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net',
        changeOrigin: true,
        secure: false,
        // Inject corporate persona tokens to elevate local proxy permissions
        headers: {
          'X-User-Id': 'sj81534',       // Overrides the unprivileged 'SYSTEM' SOEID context
          'X-User-Role': 'ROLE_DEAL_ADMIN'  // Grants full dashboard view rights
        }
      }
    }
  }
});




// // WITHOUT REWRITE

// export default defineConfig({
//   plugins: [react()],
//   build: { target: 'esnext' },
//   optimizeDeps: {
//     esbuildOptions: { target: 'esnext' }
//   },
//   // 1. Restore the base path so your URLs match the VDI environment
//   base: '/gab/ui/', 
//   resolve: {
//     alias: { '@': path.resolve(__dirname, './src') },
//   },
//   server: {
//     port: 5173,
//     host: '0.0.0.0',
//     hmr: {
//       protocol: 'ws',
//       host: 'localhost',
//       port: 5173,
//     },
//     // 2. The proxy MUST be inside the server block
//     proxy: {
//       // 3. Catch the /gab/api path the browser is sending
//       '/gab/api': {
//         target: 'https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net',
//         changeOrigin: true,
//         secure: false,
//         // 4. No rewrite needed because the browser is already 
//         // sending the full path the backend expects
//       }
//     }
//   }
// });