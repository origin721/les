# Svelte Template Syntax

## Основы
- Markup в Svelte = HTML++
- Строчные теги (`<div>`) - HTML элементы
- Заглавные теги (`<Widget>`) - компоненты

## Атрибуты элементов
```svelte
<div class="foo">
  <button disabled>can't touch this</button>
</div>
```

## JavaScript выражения
```svelte
<a href="page/{p}">page {p}</a>
<button disabled={!clickable}>...</button>
```

## События
```svelte
<button onclick={() => console.log('clicked')}>
  click me
</button>
```

## Текстовые выражения
```svelte
<h1>Hello {name}!</h1>
<p>{a} + {b} = {a + b}.</p>
```

## Spread атрибуты
```svelte
<Widget {...props} />
```

## Комментарии
```html
<!-- обычный комментарий -->
<!-- svelte-ignore a11y_autofocus -->
