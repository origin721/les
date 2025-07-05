import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // Configure base URL for GitHub Pages
  base: '/les', // process.env.NODE_ENV === 'production' ? '/secure-message/' : '/',
  server: {
    proxy: {
      '/events': {
        target: 'http://127.0.0.1:8000', // Целевой сервер
        // changeOrigin: true, // Меняет origin заголовка на целевой URL
        // rewrite: (path) => path.replace(/^\/events/, ''), // Убирает /api из пути
      }
    }
  },
  worker: {
    format: 'es', // Изменено с 'iife' на 'es' для поддержки code-splitting
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]', // Для правильного именования файлов
      },
    },
  },
})
