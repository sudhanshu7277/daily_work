// vite.config.ts


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
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.*', 'src/**/*.spec.*', 'src/test/**'],
      },
    },
  });

  //then run cmd

  npx vitest run src/pages/instructions/CompletedInstructionsPage.test.tsx