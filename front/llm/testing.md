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

```typescript
// vite.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // ... опции Vitest
  },
})
