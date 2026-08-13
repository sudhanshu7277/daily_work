export default defineConfig({
  plugins: [react()],
  build: { target: 'esnext' },
  optimizeDeps: { esbuildOptions: { target: 'esnext' } },
  base: '/nextgengab/ui',
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 5173,
    host: '0.0.0.0',
    hmr: { protocol: 'ws', host: 'localhost', port: 5173 },
    proxy: {
      '/nextgengab/api/api/v1/gab': {
        target: 'https://icg-tts-gabprocess-178500.apps.namicggtd102d.ecs.dyn.nsroot.net',
        changeOrigin: true,
        secure: false,
      },
      '/shared-services/api/payment': {
        target: 'https://payment-icg-msst-shared-services-179025.apps.namicggtd152d.ecs.dyn.nsroot.net',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const clientId =
              process.env.HARDCAP_CLIENT_ID ||
              '589e409b-cc8b-4751-a9ec-2761de0bc0d5';
            const clientSecret =
              process.env.HARDCAP_CLIENT_SECRET ||
              'X5wU61N8gQ4cA3cQ6nF0sG5fK6eV0cY7eV0vW2bI5wW4jF7iE1';

            proxyReq.setHeader('X-IBM-Client-Id', clientId);
            proxyReq.setHeader('X-IBM-Client-Secret', clientSecret);
            proxyReq.setHeader('x-citiportal-apim-client-id', clientId);
          });
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      exclude: ['**/node_modules/**', '**/src/test/**', '**/*.d.ts'],
    },
  },
});



// 


export default defineConfig({
    // ... other config
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/nextgengab/api/api/v1/gab': {
          target: 'https://icg-tts-gabprocess-178500.apps.namicggtd102d.ecs.dyn.nsroot.net',
          changeOrigin: true,
          secure: false,
        },
        // Matches both explicit /shared-services calls and root endpoints
        '/shared-services/api/payment': {
          target: 'https://icg-msst-shared-services-179025.apps.namicggtd152d.ecs.dyn.nsroot.net',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const clientId =
                process.env.HARDCAP_CLIENT_ID ||
                '589e409b-cc8b-4751-a9ec-2761de0bc0d5';
              const clientSecret =
                process.env.HARDCAP_CLIENT_SECRET ||
                'X5wU61N8gQ4cA3cQ6nF0sG5fK6eV0cY7eV0vW2bI5wW4jF7iE1';
  
              proxyReq.setHeader('X-IBM-Client-Id', clientId);
              proxyReq.setHeader('X-IBM-Client-Secret', clientSecret);
              proxyReq.setHeader('x-citiportal-apim-client-id', clientId);
            });
          },
        },
      },
    },
  });