# Тестирование с помощью Vitest

**ВНИМАНИЕ**: Это справочная информация. Используй только команду `npm run test` для запуска тестов!

## Пример теста для Svelte компонента

Для проверки того, что в элементе `body` нет текста с использованием Vitest и Svelte:

```javascript
import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import App from './App.svelte';

test('проверка, что в body нет текста', () => {
  const { container } = render(App);
  const body = container.querySelector('body');
  expect(body).toBeEmptyDOMElement();
});
```

## Ключевые моменты актуальной настройки Vitest

1. **Установка**: `npm install -D vitest` 
   - Требуется Vite >=v5.0.0 и Node.js >=v18.0.0

2. **Конфигурация**: Настройка производится в `vite.config.ts` через свойство `test`, что обеспечивает единую конфигурацию с Vite.

3. **Обновление типов**: Ссылка на типы в `vite.config.ts` обновилась.
   - **Устаревший вариант**: `/// <reference types="vitest" />`
   - **Актуальный вариант**: `/// <reference types="vitest/config" />`

4. **Workspace конфигурация**: Для разных окружений тестирования используется `vitest.workspace.ts`
   - Криптографические тесты запускаются в Node.js окружении
   - UI тесты запускаются в jsdom окружении

## Доступные команды тестирования

- `npm run test` - запуск тестов в watch режиме
- `npm run test:run` - однократный запуск всех тестов
- `npm run test:coverage` - запуск тестов с анализом покрытия кода
- `npm run test:ui` - запуск тестов с веб-интерфейсом

## Актуальная конфигурация

```typescript
// vitest.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    workspace: './vitest.workspace.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
})
