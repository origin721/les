# Svelte - Современный фреймворк для веб-разработки

## Статус изучения
- [ ] Основы Svelte
- [ ] Компоненты и props
- [ ] Реактивность и stores
- [ ] Svelte 5 и runes
- [ ] Routing и SvelteKit

## Что такое Svelte?

Svelte - это современный фреймворк для создания пользовательских интерфейсов. В отличие от других фреймворков, Svelte компилирует компоненты в оптимизированный JavaScript код во время сборки.

## Основные особенности

### Компиляция
- Нет виртуального DOM
- Компилируется в чистый JavaScript
- Меньший размер bundle

### Реактивность
- Встроенная реактивность
- Автоматическое обновление DOM
- Простой синтаксис

### Компоненты
- Файлы `.svelte`
- HTML, CSS и JavaScript в одном файле
- Scoped стили

## Основной синтаксис

```svelte
<script>
  let count = 0;
  
  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>
  Clicked {count} times
</button>

<style>
  button {
    background: #ff3e00;
    color: white;
  }
</style>
```

## Svelte 5 и Runes

Svelte 5 вводит новую систему реактивности с помощью runes:

```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  function increment() {
    count++;
  }
</script>
```

## Применение в проекте

В нашем проекте Svelte используется для:
- Frontend приложения
- Создания интерактивных компонентов
- Управления состоянием приложения

## Анализ реального компонента

### Структура App.svelte
```svelte
<script lang="ts">
  import { appProcessesMount } from "./processes";
  import { RoutesView } from "./routing";

  appProcessesMount();
</script>

<RoutesView />
```

### Пример компонента с Svelte 5 runes
Компонент `CryptoPageEncrypt.svelte` демонстрирует использование новых runes:

```svelte
<script lang="ts">
    // Svelte 5 runes для состояния
    let selectedMyKeyId = $state("");
    let selectedPartnerKeyId = $state("");
    let encryptedText = $state("");
    let isVerifyEncrypt = $state(false);
    let sourceMessage = $state("");

    // Derived state
    const store = $derived($apiKeysStore);

    // Обработчик событий
    async function onEncrypt(e: SubmitParam) {
        e.preventDefault();
        // Логика шифрования...
    }
</script>

<!-- Условный рендеринг -->
{#if store.partnerKeys.length === 0}
    <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Сначала добавьте ключи партнеров на вкладке "Управление ключами"</p>
    </div>
{:else}
    <!-- Форма с привязкой данных -->
    <form onsubmit={onEncrypt} class="flex-col flex gap-4">
        <select bind:value={selectedPartnerKeyId} required>
            <option value="">-- Выберите партнера --</option>
            {#each store.partnerKeys as partnerKey}
                <option value={partnerKey.id}>{partnerKey.name}</option>
            {/each}
        </select>
        
        <textarea 
            bind:value={sourceMessage} 
            class="min-h-[5rem] border border-gray-300 rounded px-3 py-2"
            required
        ></textarea>
        
        <button class={btn} type="submit">Зашифровать</button>
    </form>
{/if}
```

### Особенности использования в проекте
1. **TypeScript**: Все компоненты используют TypeScript
2. **Svelte 5 runes**: `$state()`, `$derived()` для реактивности
3. **Tailwind CSS**: Для стилизации компонентов
4. **Stores**: Глобальное состояние через stores
5. **Event handling**: Современный синтаксис обработки событий

## Файлы проекта

- `front/src/App.svelte` - Главный компонент
- `front/src/components/` - Переиспользуемые компоненты
- `front/src/pages/` - Страницы приложения
- `front/src/stores/` - Глобальное состояние

## Структура компонента

```
Component.svelte
├── <script>     # Логика компонента
├── <template>   # HTML разметка
└── <style>      # CSS стили
```

## Следующие шаги изучения

1. [ ] Изучить основы синтаксиса Svelte
2. [ ] Понять систему компонентов
3. [ ] Освоить реактивность и stores
4. [ ] Изучить Svelte 5 runes
5. [ ] Применить в реальных компонентах

## Полезные ресурсы

- [Официальная документация Svelte](https://svelte.dev/)
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [Svelte 5 Documentation](https://svelte-5-preview.vercel.app/)
- Локальная документация: `front/docs/svelte-*.md`

## Инструменты разработки

- Vite - сборщик проекта
- TypeScript - типизация
- Tailwind CSS - стилизация
- ESLint - линтер
