import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      '/events': {
        target: 'http://127.0.0.1:8000', // Целевой сервер
        // changeOrigin: true, // Меняет origin заголовка на целевой URL
        // rewrite: (path) => path.replace(/^\/events/, ''), // Убирает /api из пути
      }
    }
  }
})
