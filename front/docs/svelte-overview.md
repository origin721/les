# Svelte Overview

## Что такое Svelte
- Фреймворк для создания пользовательских интерфейсов
- Использует компилятор для преобразования декларативных компонентов
- Превращает HTML, CSS и JavaScript в оптимизированный код

## Основная структура компонента
```svelte
<script>
  function greet() {
    alert('Welcome to Svelte!');
  }
</script>

<button onclick={greet}>click me</button>

<style>
  button {
    font-size: 2em;
  }
</style>
```

## Применение
- Отдельные компоненты
- Полноценные приложения с SvelteKit
- Все что между ними

## Ресурсы
- Интерактивный туториал: /tutorial
- Playground: /playground
- StackBlitz для полной среды разработки
