# Тестирование - Руководство для LLM

## 🧪 Обзор тестирования в проекте
- **Vitest** - юнит и интеграционное тестирование
- **Playwright** - E2E тестирование
- **Svelte 5 runes** - особенности тестирования новых возможностей

## 🔧 Настройка Vitest

Vitest уже настроен в проекте. Проверь файлы:
- `vitest.config.ts` - основная конфигурация
- `vitest.workspace.ts` - workspace настройки

### Команды для тестирования:
```bash
npm run test          # запуск всех тестов
npm run test:watch    # watch режим
npm run test:ui       # UI интерфейс для тестов
```

## 📁 Структура тестов в проекте

```
src/tests/           # основные тесты
src/widgets/         # тесты компонентов (если есть)
src/stores/          # тесты стора (*.test.ts)
src/pages/           # тесты страниц
```

## 🎯 Примеры тестов для проекта

### Тестирование криптографии
```typescript
import { test, expect } from 'vitest';
import { encrypt_curve25519, decrypt_curve25519, generate_keys_curve25519 } from 'src/core/crypt';

test('Curve25519 шифрование/расшифровка', () => {
  const { publicKey, privateKey } = generate_keys_curve25519();
  const message = 'секретное сообщение';
  
  const encrypted = encrypt_curve25519(message, publicKey, privateKey);
  const decrypted = decrypt_curve25519(encrypted, publicKey, privateKey);
  
  expect(decrypted).toBe(message);
});
```

### Тестирование IndexedDB
```typescript
import { test, expect } from 'vitest';
import { add_account, get_account_by_id } from 'src/indexdb/accounts';

test('Добавление и получение аккаунта', async () => {
  const account = {
    name: 'test_user',
    publicKey: 'test_key',
    privateKey: 'test_private'
  };
  
  const id = await add_account(account);
  const retrieved = await get_account_by_id(id);
  
  expect(retrieved.name).toBe(account.name);
});
```

### Тестирование Svelte 5 runes
```typescript
import { test, expect } from 'vitest';
import { flushSync } from 'svelte';

test('Тестирование $state rune', () => {
  let count = $state(0);
  
  expect(count).toBe(0);
  
  count = 5;
  flushSync();
  
  expect(count).toBe(5);
});
```

### Тестирование виджетов
```typescript
import { test, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import LoadingSequence from 'src/components/widgets/LoadingSequence.svelte';

test('LoadingSequence компонент', () => {
  const component = mount(LoadingSequence, {
    target: document.body,
    props: { text: 'Загрузка...' }
  });
  
  expect(document.body.textContent).toContain('Загрузка...');
  
  unmount(component);
});
```

## 🎭 E2E тестирование с Playwright

### Настройка уже есть в проекте:
```javascript
// playwright.config.js
const config = {
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI
  },
  testDir: 'tests',
  use: {
    baseURL: 'http://localhost:5173'
  }
};
```

### Пример E2E теста
```typescript
import { test, expect } from '@playwright/test';

test('Главная страница загружается', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});

test('Авторизация работает', async ({ page }) => {
  await page.goto('/auth');
  await page.fill('[data-testid="username"]', 'test_user');
  await page.fill('[data-testid="password"]', 'test_pass');
  await page.click('[data-testid="login-btn"]');
  
  await expect(page).toHaveURL('/home');
});
```

## ⚠️ Важные моменты для LLM

1. **Используй data-testid** атрибуты для стабильного тестирования
2. **Тестируй криптографию** - это критично для безопасности  
3. **IndexedDB тесты** требуют настройки fake indexeddb
4. **Svelte 5 runes** требуют `flushSync()` для синхронного тестирования
5. **Виджеты НЕ компоненты** - тестируй файлы из `src/widgets/`

## 🚀 Команды для запуска

```bash
npm run test                    # все тесты
npm run test src/tests/         # только юнит тесты  
npm run test:e2e               # только E2E тесты
npm run test:coverage          # с покрытием кода
```
