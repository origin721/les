import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        // Указываем основную точку входа для приложения Svelte
        main: path.resolve(__dirname, 'index.html'),
        // Добавляем отдельную точку входа для дополнительного файла
        extra: path.resolve(__dirname, 'extra/extra.js'),
      },
      output: [
        // Основной вывод для стандартного dist
        {
          dir: path.resolve(__dirname, 'dist'),
          format: 'es',
          entryFileNames: '[name].js',
        },
        // Вывод для дополнительной сборки в папку dist2
      ],
    },
  }
})
