/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte({ 
    hot: !process.env.VITEST,
    compilerOptions: {
      dev: !process.env.VITEST
    }
  })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    // Настройка coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'build/'
      ]
    },
    // Настройка разных окружений для разных типов тестов
    environmentMatchGlobs: [
      // Криптографические тесты запускаются в Node.js окружении
      ['src/core/crypt/**/*.test.js', 'node']
    ]
  },
  define: {
    global: 'globalThis'
  },
  resolve: {
    conditions: ['browser']
  }
})
