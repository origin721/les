import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      include: ['src/**/*.test.{ts,js}', '!src/core/crypt/**/*.test.js'],
      name: 'browser',
      environment: 'jsdom',
    }
  },
  {
    test: {
      include: ['src/core/crypt/**/*.test.js'],
      name: 'crypto',
      environment: 'node',
      globals: true,
      setupFiles: ['./src/tests/setup.ts'],
    }
  }
])
