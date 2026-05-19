// //LATEST VITE CONFIG FOR VDI ENVIRONMENT

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: { target: 'esnext' },
  optimizeDeps: {
    esbuildOptions: { target: 'esnext' }
  },
  // 1. Restore the base path so your URLs match the VDI environment
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
    // 2. The proxy MUST be inside the server block
    proxy: {
      '/api': {
        target: 'https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net',
        changeOrigin: true,
        secure: false,
        // Rewrites /api/v1/... to /gab/api/v1/...
        rewrite: (path) => path.replace(/^\/api/, '/gab/api') 
      }
    }
  }
})


// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// export default defineConfig({
//   plugins: [react()],
//   build: { target: 'esnext' },
//   optimizeDeps: {
//     esbuildOptions: { target: 'esnext' }
//   },
//   base: '/gab/ui/',
//   resolve: {
//     alias: { '@': path.resolve(__dirname, './src') },
//   },
//   server: {
//     port: 5173,
//     host: '0.0.0.0',
//     // No HMR host overrides here, keeping it local
//     proxy: {
//       '/gab/api': {
//         target: 'https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net',
//         changeOrigin: true,
//         secure: false,
//         headers: {
//           // 1. Keep your auth.ts overrides
//           'X-User-Id': 'sj81534',
//           'X-User-Role': 'ROLE_DEAL_ADMIN',
          
//           // 2. Add these to mimic a fully authorized corporate browser session
//           'OIDC_CLAIM_USERID': 'sj81534',
//           'OIDC_CLAIM_ROLES': 'ROLE_DEAL_ADMIN',
//           'sm_user': 'sj81534'
//         }
//       }
//     }
//   }
// });




// // // WITHOUT REWRITE

// // export default defineConfig({
// //   plugins: [react()],
// //   build: { target: 'esnext' },
// //   optimizeDeps: {
// //     esbuildOptions: { target: 'esnext' }
// //   },
// //   // 1. Restore the base path so your URLs match the VDI environment
// //   base: '/gab/ui/', 
// //   resolve: {
// //     alias: { '@': path.resolve(__dirname, './src') },
// //   },
// //   server: {
// //     port: 5173,
// //     host: '0.0.0.0',
// //     hmr: {
// //       protocol: 'ws',
// //       host: 'localhost',
// //       port: 5173,
// //     },
// //     // 2. The proxy MUST be inside the server block
// //     proxy: {
// //       // 3. Catch the /gab/api path the browser is sending
// //       '/gab/api': {
// //         target: 'https://icg-msst-shared-services.apps.namicggtd152d.ecs.dyn.nsroot.net',
// //         changeOrigin: true,
// //         secure: false,
// //         // 4. No rewrite needed because the browser is already 
// //         // sending the full path the backend expects
// //       }
// //     }
// //   }
// // });