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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'build/'
      ]
    }
  },
  define: {
    global: 'globalThis'
  },
  resolve: {
    conditions: ['browser']
  }
})
