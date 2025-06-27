# Svelte 5 - Управление состоянием

В Svelte 5, который пока находится в стадии preview, управление состоянием (state) можно осуществлять с помощью нового API, основанного на реактивных переменных и функциях. Вот пример того, как можно создать и управлять состоянием в Svelte 5:

## 1. Создание реактивного состояния

Используйте переменные с префиксом `$` для создания реактивных состояний.

```svelte
<script>
    let count = $state(0);

    function increment() {
        count += 1;
    }
</script>

<button on:click={increment}>
    Clicked {count} {count === 1 ? 'time' : 'times'}
</button>
```

## 2. Использование реактивных выражений

Вы можете создавать реактивные выражения, которые автоматически обновляются при изменении зависимостей.

```svelte
<script>
    let count = $state(0);
    let double = $derived(count * 2);

    function increment() {
        count += 1;
    }
</script>

<button on:click={increment}>
    Clicked {count} {count === 1 ? 'time' : 'times'}, double is {double}
</button>
```

## 3. Использование эффектов

Для выполнения побочных эффектов при изменении состояния используйте `$effect`.

```svelte
<script>
    let count = $state(0);

    $effect(() => {
        console.log(`Count is now ${count}`);
    });

    function increment() {
        count += 1;
    }
</script>

<button on:click={increment}>
    Clicked {count} {count === 1 ? 'time' : 'times'}
</button>
```

## Хранилища (Stores) в Svelte 5

В Svelte 5 концепция хранилищ (stores) остается важной частью управления состоянием. Однако, новый синтаксис с использованием `$state` предназначен для упрощения работы с реактивными состояниями внутри компонентов.

### Создание хранилища в отдельном файле

Создайте файл, например, `stores.js`:

```javascript
// stores.js
import { writable } from 'svelte/store';

// Создаем хранилище
export const countStore = writable(0);
```

### Использование хранилища в компоненте

```svelte
<script>
    import { countStore } from './stores.js';

    function increment() {
        countStore.update(n => n + 1);
    }
</script>

<button on:click={increment}>
    Clicked {$countStore} {$countStore === 1 ? 'time' : 'times'}
</button>
```

## Пример как в React - вынос логики в отдельный файл

```javascript
import { onDestroy } from 'svelte';
import type { Readable } from 'svelte/store';

export function writableToState<T>(store: Readable<T>): {state: T} {
  let state = $state<T>();

  const unsubscribe = store.subscribe(value => {
    state = value;
  });

  onDestroy(unsubscribe);

  return {
    get state() { return state },
    set(value: T) { state = value }
  };
}
```

Этот пример лежит в проекте как актуальный образцовый.
