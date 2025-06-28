# Svelte 5 - Официальная документация для разработчиков

Это расширенная документация по Svelte 5 с официальной информацией от команды Svelte для продвинутых разработчиков.

## Что такое Runes?

> **rune** /ruːn/ _noun_
> 
> A letter or mark used as a mystical or magic symbol.

Runes - это символы, которые используются в `.svelte` и `.svelte.js`/`.svelte.ts` файлах для управления компилятором Svelte. Если думать о Svelte как о языке, то runes - это часть синтаксиса, они являются _ключевыми словами_.

### Основные характеристики Runes:

- Имеют префикс `$` и выглядят как функции: `let message = $state('hello');`
- Не нужно импортировать - они часть языка
- Это не значения - нельзя присвоить переменной или передать как аргумент функции
- Как и ключевые слова JavaScript, валидны только в определенных позициях

> **Важно:** Runes не существовали до Svelte 5.

## $state - Реактивное состояние

`$state` позволяет создавать _реактивное состояние_, что означает, что UI _реагирует_ при его изменении.

### Базовое использование:

```svelte
<script>
	let count = $state(0);
</script>

<button onclick={() => count++}>
	clicks: {count}
</button>
```

В отличие от других фреймворков, нет API для взаимодействия с состоянием - `count` это просто число, а не объект или функция.

### Глубокое состояние (Deep state)

Если `$state` используется с массивом или простым объектом, результат - глубоко реактивный _state proxy_:

```js
let todos = $state([
	{
		done: false,
		text: 'add more todos'
	}
]);

// Изменение отдельного свойства todo вызовет обновления
todos[0].done = !todos[0].done;

// Добавление нового объекта также сделает его проксированным
todos.push({
	done: false,
	text: 'eat lunch'
});
```

> **Примечание:** При обновлении свойств прокси, оригинальный объект _не_ мутируется.

### Классы

Экземпляры классов не проксируются. Вместо этого можно использовать `$state` в полях класса:

```js
class Todo {
	done = $state(false);

	constructor(text) {
		this.text = $state(text);
	}

	reset = () => {
		this.text = '';
		this.done = false;
	}
}
```

### $state.raw

Для случаев, когда не нужна глубокая реактивность:

```js
let person = $state.raw({
	name: 'Heraclitus',
	age: 49
});

// это не сработает
person.age += 1;

// это сработает - создаем новый объект
person = {
	name: 'Heraclitus',
	age: 50
};
```

### $state.snapshot

Для создания статического снимка глубоко реактивного `$state` прокси:

```svelte
<script>
	let counter = $state({ count: 0 });

	function onclick() {
		// Выведет `{ count: ... }` вместо `Proxy { ... }`
		console.log($state.snapshot(counter));
	}
</script>
```

## $derived - Производные значения

Производное состояние объявляется с помощью `$derived`:

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>
	{doubled}
</button>

<p>{count} doubled is {doubled}</p>
```

### Ключевые особенности:

- Выражение внутри `$derived(...)` должно быть без побочных эффектов
- Svelte запретит изменения состояния (например, `count++`) внутри derived выражений
- Код выполняется только один раз при создании, без `$derived` значение не обновлялось бы

### $derived.by

Для сложных вычислений, которые не помещаются в короткое выражение:

```svelte
<script>
	let numbers = $state([1, 2, 3]);
	let total = $derived.by(() => {
		let total = 0;
		for (const n of numbers) {
			total += n;
		}
		return total;
	});
</script>
```

### Переопределение derived значений

Derived выражения пересчитываются при изменении зависимостей, но можно временно переопределить их значения:

```svelte
<script>
	let { post, like } = $props();
	let likes = $derived(post.likes);

	async function onclick() {
		// немедленно увеличиваем счетчик лайков...
		likes += 1;

		// и сообщаем серверу
		try {
			await like();
		} catch {
			// неудача! откатываем изменение
			likes -= 1;
		}
	}
</script>
```

## $effect - Побочные эффекты

Effects - это функции, которые выполняются при обновлении состояния. Используются для вызова сторонних библиотек, рисования на `<canvas>`, сетевых запросов.

### Базовое использование:

```svelte
<script>
	let size = $state(50);
	let color = $state('#ff3e00');
	let canvas;

	$effect(() => {
		const context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);

		// это будет перезапускаться при изменении `color` или `size`
		context.fillStyle = color;
		context.fillRect(0, 0, size, size);
	});
</script>

<canvas bind:this={canvas} width="100" height="100"></canvas>
```

### Жизненный цикл

- Effects выполняются после монтирования компонента в DOM
- Выполняются в [microtask](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide) после изменений состояния
- Перезапуски группируются (изменение `color` и `size` одновременно не вызовет два отдельных запуска)

### Функция очистки (Teardown)

Effect может возвращать функцию очистки:

```svelte
<script>
	let count = $state(0);
	let milliseconds = $state(1000);

	$effect(() => {
		const interval = setInterval(() => {
			count += 1;
		}, milliseconds);

		return () => {
			// функция очистки выполнится:
			// a) непосредственно перед повторным запуском effect
			// b) при уничтожении компонента
			clearInterval(interval);
		};
	});
</script>
```

### Понимание зависимостей

`$effect` автоматически отслеживает любые реактивные значения (`$state`, `$derived`, `$props`), которые _синхронно_ читаются внутри его тела функции.

Значения, которые читаются _асинхронно_ (после `await` или внутри `setTimeout`) не отслеживаются.

### $effect.pre

Для редких случаев, когда нужно выполнить код _до_ обновления DOM:

```svelte
<script>
	let div = $state();
	let messages = $state([]);

	$effect.pre(() => {
		if (!div) return;

		messages.length; // ссылаемся на длину массива для перезапуска

		// автопрокрутка при добавлении новых сообщений
		if (div.offsetHeight + div.scrollTop > div.scrollHeight - 20) {
			tick().then(() => {
				div.scrollTo(0, div.scrollHeight);
			});
		}
	});
</script>
```

### $effect.tracking

Продвинутая функция, которая показывает, выполняется ли код в контексте отслеживания:

```svelte
<script>
	console.log('in component setup:', $effect.tracking()); // false

	$effect(() => {
		console.log('in effect:', $effect.tracking()); // true
	});
</script>

<p>in template: {$effect.tracking()}</p> <!-- true -->
```

### $effect.root

Создает неотслеживаемую область, которая не очищается автоматически:

```js
const destroy = $effect.root(() => {
	$effect(() => {
		// setup
	});

	return () => {
		// cleanup
	};
});

// позже...
destroy();
```

### Когда НЕ использовать $effect

Избегайте использования для синхронизации состояния. Вместо:

```svelte
<script>
	let count = $state(0);
	let doubled = $state();

	// не делайте так!
	$effect(() => {
		doubled = count * 2;
	});
</script>
```

Делайте так:

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>
```

## Лучшие практики

### 1. Предпочитайте $derived вместо $effect для вычислений

```svelte
<!-- ✅ Хорошо -->
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

<!-- ❌ Плохо -->
<script>
	let count = $state(0);
	let doubled = $state(0);
	
	$effect(() => {
		doubled = count * 2;
	});
</script>
```

### 2. Используйте $effect для побочных эффектов

```svelte
<!-- ✅ Хорошо - для DOM манипуляций, API вызовов -->
<script>
	let data = $state([]);
	
	$effect(() => {
		fetch('/api/data')
			.then(r => r.json())
			.then(d => data = d);
	});
</script>

<!-- ✅ Хорошо - для интеграции с внешними библиотеками -->
<script>
	let canvas;
	let size = $state(100);
	
	$effect(() => {
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, size, size);
		// рисование...
	});
</script>
```

### 3. Правильная работа с классами

```svelte
<script>
	class Counter {
		count = $state(0);
		
		increment = () => {
			this.count++;
		}
	}
	
	let counter = new Counter();
</script>

<button onclick={counter.increment}>
	Count: {counter.count}
</button>
```

### 4. Обмен состоянием между модулями

```js
// store.svelte.js
export const appState = $state({
	user: null,
	theme: 'light'
});

export function setUser(user) {
	appState.user = user;
}

export function toggleTheme() {
	appState.theme = appState.theme === 'light' ? 'dark' : 'light';
}
```

## Миграция с Svelte 4

### Замена реактивных деклараций

```svelte
<!-- Svelte 4 -->
<script>
	let count = 0;
	$: doubled = count * 2;
</script>

<!-- Svelte 5 -->
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>
```

### Замена stores на runes

```svelte
<!-- Svelte 4 -->
<script>
	import { writable } from 'svelte/store';
	
	const count = writable(0);
	
	function increment() {
		count.update(n => n + 1);
	}
</script>

<button on:click={increment}>
	{$count}
</button>

<!-- Svelte 5 -->
<script>
	let count = $state(0);
	
	function increment() {
		count++;
	}
</script>

<button onclick={increment}>
	{count}
</button>
```

## Интеграция с существующими stores

Для совместимости с существующими Svelte stores:

```js
import { onDestroy } from 'svelte';

export function writableToState(store) {
	let state = $state();

	const unsubscribe = store.subscribe(value => {
		state = value;
	});

	onDestroy(unsubscribe);

	return {
		get state() { return state },
		set(value) { state = value }
	};
}
```

## Заключение

Svelte 5 с runes предоставляет более мощную и предсказуемую систему реактивности. Основные преимущества:

- **Явность**: Четко видно, что является реактивным
- **Производительность**: Более эффективное отслеживание зависимостей
- **Простота**: Меньше магии, больше прямолинейности
- **Совместимость**: Можно постепенно мигрировать с Svelte 4

Runes - это будущее Svelte, и они делают разработку более предсказуемой и производительной.
