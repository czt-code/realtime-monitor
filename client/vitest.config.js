import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: false,
    environment: 'jsdom',
    testTimeout: 10000,
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
