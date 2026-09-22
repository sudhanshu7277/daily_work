// Step 1: Fix the Missing Native Rollup Dependency

npm install -D @rollup/rollup-win32-x64-msvc@^4.28.0


//Step 2: Configure vite.config.ts to Proxy to Local Port 8080
// In vite.config.ts (lines 204–212), configure the server proxy so all 
// /nextgengab/api and /shared-services requests route to your local Java backend:

server: {
  port: 3000,
  proxy: {
    '/nextgengab/api': {
      target: 'http://127.0.0.1:8080',
      changeOrigin: true,
      secure: false,
    },
    '/shared-services': {
      target: 'http://127.0.0.1:8080',
      changeOrigin: true,
      secure: false,
    },
  },
},


/// Step 3: Align Endpoint Path in Frontend Code
If your Java Spring Boot controller is mapped to:

// @RequestMapping("/nextgengab/api/v1/gab/payments/checker")


//Ensure your fetch call in PaymentParent.tsx uses a single /api

const endpoint = '/nextgengab/api/v1/gab/payments/checker/approve';


// If your Java controller is mapped without 
// the /nextgengab prefix (e.g., @RequestMapping("/api/v1/gab/...")

'/nextgengab/api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/nextgengab/, ''),
        },


// Step 4: Restart the Development Server
// Run the development server script defined on line 8 of package.json


npm run dev