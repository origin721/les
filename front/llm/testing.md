# Тестирование - Практическое руководство

## 🚀 Быстрый старт

**Главное правило**: Используй только `npm run test` для запуска тестов!

## Основные команды

```bash
npm run test          # Watch режим для разработки
npm run test:run      # Однократный запуск всех тестов  
npm run test:coverage # Анализ покрытия кода
npm run test:ui       # Веб-интерфейс для тестов
```

## Примеры тестов для проекта

### Тест Svelte компонента
```javascript
import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import MyComponent from './MyComponent.svelte';

test('компонент рендерится правильно', () => {
  const { container } = render(MyComponent, { 
    props: { title: 'Тест' } 
  });
  
  expect(container.querySelector('h1')).toHaveTextContent('Тест');
});
```

### Тест криптографических функций (в Node.js окружении)
```javascript
import { expect, test } from 'vitest';
import { encrypt, decrypt } from '../core/crypt/libsodium.ts';

test('шифрование и расшифровка', async () => {
  const message = 'Секретное сообщение';
  const encrypted = await encrypt(message);
  const decrypted = await decrypt(encrypted);
  
  expect(decrypted).toBe(message);
});
```

### Тест store
```javascript
import { get } from 'svelte/store';
import { expect, test } from 'vitest';
import { myStore } from './stores/myStore.ts';

test('store работает корректно', () => {
  expect(get(myStore)).toBe(initialValue);
  
  myStore.set(newValue);
  expect(get(myStore)).toBe(newValue);
});
```

## Особенности проекта

### Окружения тестов
- **jsdom** - для UI компонентов Svelte
- **node** - для криптографических функций (libsodium)

### Workspace конфигурация
Тесты автоматически разделяются:
- UI тесты → jsdom окружение
- Крипто тесты → node окружение

## Полезные паттерны

### Тестирование асинхронного кода
```javascript
import { flushSync } from 'svelte';

test('асинхронное обновление', async () => {
  // Код теста
  flushSync(); // Синхронно выполнить все pending эффекты
  // Проверки
});
```

### Мокирование модулей
```javascript
import { vi } from 'vitest';

vi.mock('../api/http', () => ({
  request: vi.fn().mockResolvedValue({ data: 'mock' })
}));
```

## 🔧 Troubleshooting

### Тест падает с ошибкой окружения
- Проверь, что крипто тесты в `src/core/crypt/` - они должны быть в node окружении
- UI тесты должны быть в jsdom

### TypeScript ошибки
- Убедись что используется `/// <reference types="vitest/config" />`
- Проверь imports тестовых утилит

### Coverage не работает  
- Установи `@vitest/coverage-v8`
- Запусти `npm run test:coverage`

## 📚 Дополнительно

Для глубокого изучения смотри:
- `testing-configuration.md` - техническая конфигурация
- Официальную документацию Vitest
