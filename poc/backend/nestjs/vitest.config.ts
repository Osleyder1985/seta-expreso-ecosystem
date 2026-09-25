import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.e2e-spec.ts'],
    environment: 'node',
    globals: false,
    testTimeout: 30000,
    hookTimeout: 30000
  }
});
