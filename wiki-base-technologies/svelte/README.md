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
