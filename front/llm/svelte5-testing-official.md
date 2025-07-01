# Svelte 5 - Ключевые концепции тестирования

> Справочник по тестированию Svelte 5 - сокращенная версия

## Тестирование рун ($state, $effect, $derived)

### Базовое использование рун в тестах

```js
import { flushSync } from 'svelte';
import { expect, test } from 'vitest';

// Тест с $state
test('тестирование $state', () => {
  let count = $state(0);
  expect(count).toBe(0);
  
  count = 5;
  expect(count).toBe(5);
});

// Тест с $effect - нужен $effect.root
test('тестирование $effect', () => {
  const cleanup = $effect.root(() => {
    let count = $state(0);
    let log = [];

    $effect(() => {
      log.push(count);
    });

    flushSync(); // Синхронно выполнить эффекты
    expect(log).toEqual([0]);

    count = 1;
    flushSync();
    expect(log).toEqual([0, 1]);
  });

  cleanup(); // Важно очистить эффекты
});
```

### Тестирование функций с рунами

```js
// функция с рунами
export function reactiveCounter(initial) {
  let count = $state(initial);
  
  return {
    get value() { return count; },
    increment: () => count++,
    set: (val) => count = val
  };
}

// тест
test('реактивный счетчик', () => {
  const counter = reactiveCounter(0);
  
  expect(counter.value).toBe(0);
  
  counter.increment();
  expect(counter.value).toBe(1);
  
  counter.set(10);
  expect(counter.value).toBe(10);
});
```

## Тестирование компонентов

### Использование mount/unmount API

```js
import { flushSync, mount, unmount } from 'svelte';
import { expect, test } from 'vitest';
import Component from './Component.svelte';

test('тест компонента', () => {
  const component = mount(Component, {
    target: document.body,
    props: { title: 'Тест' }
  });

  expect(document.body.innerHTML).toContain('Тест');

  // Взаимодействие и проверка
  const button = document.body.querySelector('button');
  button.click();
  flushSync();

  // Очистка
  unmount(component);
});
```

### Использование @testing-library/svelte (рекомендуется)

```js
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import Component from './Component.svelte';

test('тест с testing library', async () => {
  const user = userEvent.setup();
  render(Component, { props: { title: 'Тест' } });

  const button = screen.getByRole('button');
  expect(button).toHaveTextContent('Кнопка');

  await user.click(button);
  expect(screen.getByText('Нажато')).toBeInTheDocument();
});
```

## Тестирование stores

```js
import { get } from 'svelte/store';
import { writable, derived } from 'svelte/store';

test('writable store', () => {
  const store = writable(0);
  
  expect(get(store)).toBe(0);
  
  store.set(5);
  expect(get(store)).toBe(5);
  
  store.update(n => n * 2);
  expect(get(store)).toBe(10);
});

test('derived store', () => {
  const count = writable(5);
  const doubled = derived(count, $count => $count * 2);
  
  expect(get(doubled)).toBe(10);
  
  count.set(3);
  expect(get(doubled)).toBe(6);
});
```

## Важные концепции

### flushSync для синхронных тестов
```js
import { flushSync } from 'svelte';

// Используй flushSync после изменений состояния
count = newValue;
flushSync(); // Выполнить все pending обновления
// Теперь можно проверять результат
```

### $effect.root для эффектов в тестах
```js
test('тест с эффектом', () => {
  const cleanup = $effect.root(() => {
    // Код с $effect
  });
  
  // После теста обязательно
  cleanup();
});
```

### Конфигурация для jsdom
```js
// vite.config.js
export default defineConfig({
  test: {
    environment: 'jsdom', // Для тестирования компонентов
    globals: true
  }
});
```

## Полезные паттерны

### Мокирование модулей
```js
import { vi } from 'vitest';

vi.mock('./api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'mock' })
}));
```

### Тестирование actions
```js
test('action', () => {
  const node = document.createElement('div');
  const destroy = myAction(node, 'parameter');
  
  // Проверка поведения action
  
  destroy?.(); // Очистка
});
```
