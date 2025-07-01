# Тестирование - Официальная документация Svelte 5

> Оригинальная документация от Svelte для полного справочника

## Тестирование

Тестирование помогает писать и поддерживать код, а также защищаться от регрессий. Фреймворки тестирования помогают вам в этом, позволяя описывать утверждения или ожидания о том, как должен вести себя ваш код. Svelte не навязывает какой-либо фреймворк тестирования — вы можете писать юнит-тесты, интеграционные тесты и end-to-end тесты, используя решения вроде Vitest, Jasmine, Cypress и Playwright.

## Юнит и интеграционное тестирование с Vitest

Юнит-тесты позволяют тестировать небольшие изолированные части вашего кода. Интеграционные тесты позволяют тестировать части приложения, чтобы увидеть, работают ли они вместе. Если вы используете Vite (включая SvelteKit), мы рекомендуем использовать Vitest. Вы можете использовать Svelte CLI для настройки Vitest либо во время создания проекта, либо позже.

Чтобы настроить Vitest вручную, сначала установите его:

```bash
npm install -D vitest
```

Затем настройте ваш vite.config.js:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
	// ...
	// Tell Vitest to use the `browser` entry points in `package.json` files, even though it's running in Node
	resolve: process.env.VITEST
		? {
				conditions: ['browser']
			}
		: undefined
});
```

Если загрузка браузерной версии всех ваших пакетов нежелательна, потому что (например) вы также тестируете бэкенд-библиотеки, вам может потребоваться прибегнуть к конфигурации псевдонимов.

Теперь вы можете писать юнит-тесты для кода внутри ваших .js/.ts файлов:

**multiplier.svelte.test**

```js
import { flushSync } from 'svelte';
import { expect, test } from 'vitest';
import { multiplier } from './multiplier.svelte.js';

test('Multiplier', () => {
	let double = multiplier(0, 2);

	expect(double.value).toEqual(0);

	double.set(5);

	expect(double.value).toEqual(10);
});
```

**multiplier.svelte**

```js
export function multiplier(initial: number, k: number) {
	let count = $state(initial);

	return {
		get value() {
			return count * k;
		},

		set: (c: number) => {
			count = c;
		}
	};
}
```

## Использование рун внутри тестовых файлов

Поскольку Vitest обрабатывает ваши тестовые файлы так же, как и исходные файлы, вы можете использовать руны внутри тестов, если имя файла включает .svelte:

**multiplier.svelte.test**

```js
import { flushSync } from 'svelte';
import { expect, test } from 'vitest';
import { multiplier } from './multiplier.svelte.js';

test('Multiplier', () => {
	let count = $state(0);
	let double = multiplier(() => count, 2);

	expect(double.value).toEqual(0);

	count = 5;

	expect(double.value).toEqual(10);
});
```

**multiplier.svelte**

```js
export function multiplier(getCount: () => number, k: number) {
	return {
		get value() {
			return getCount() * k;
		}
	};
}
```

Если тестируемый код использует эффекты, вам нужно обернуть тест внутри $effect.root:

**logger.svelte.test**

```js
import { flushSync } from 'svelte';
import { expect, test } from 'vitest';
import { logger } from './logger.svelte.js';

test('Effect', () => {
	const cleanup = $effect.root(() => {
		let count = $state(0);

		// logger uses an $effect to log updates of its input
		let log = logger(() => count);

		// effects normally run after a microtask,
		// use flushSync to execute all pending effects synchronously
		flushSync();
		expect(log).toEqual([0]);

		count = 1;
		flushSync();

		expect(log).toEqual([0, 1]);
	});

	cleanup();
});
```

**logger.svelte**

```js
export function logger(getValue: () => any) {
	let log: any[] = [];

	$effect(() => {
		log.push(getValue());
	});

	return log;
}
```

## Тестирование компонентов

Можно тестировать ваши компоненты в изоляции, используя Vitest.

> Перед написанием тестов компонентов подумайте, действительно ли вам нужно тестировать компонент, или это больше касается логики внутри компонента. Если так, рассмотрите возможность извлечения этой логики для тестирования в изоляции, без накладных расходов компонента

Для начала установите jsdom (библиотека, которая имитирует DOM API):

```bash
npm install -D jsdom
```

Затем настройте ваш vite.config.js:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		/* ... */
	],
	test: {
		// If you are testing components client-side, you need to setup a DOM environment.
		// If not all your files should have this environment, you can use a
		// `// @vitest-environment jsdom` comment at the top of the test files instead.
		environment: 'jsdom'
	},
	// Tell Vitest to use the `browser` entry points in `package.json` files, even though it's running in Node
	resolve: process.env.VITEST
		? {
				conditions: ['browser']
			}
		: undefined
});
```

После этого вы можете создать тестовый файл, в котором импортируете компонент для тестирования, взаимодействуете с ним программно и записываете ожидания о результатах:

**component.test**

```js
import { flushSync, mount, unmount } from 'svelte';
import { expect, test } from 'vitest';
import Component from './Component.svelte';

test('Component', () => {
	// Instantiate the component using Svelte's `mount` API
	const component = mount(Component, {
		target: document.body, // `document` exists because of jsdom
		props: { initial: 0 }
	});

	expect(document.body.innerHTML).toBe('<button>0</button>');

	// Click the button, then flush the changes so you can synchronously write expectations
	document.body.querySelector('button').click();
	flushSync();

	expect(document.body.innerHTML).toBe('<button>1</button>');

	// Remove the component from the DOM
	unmount(component);
});
```

Хотя процесс очень простой, он также низкоуровневый и несколько хрупкий, поскольку точная структура вашего компонента может часто изменяться. Инструменты вроде @testing-library/svelte могут помочь упростить ваши тесты. Приведенный выше тест можно переписать так:

**component.test**

```js
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import Component from './Component.svelte';

test('Component', async () => {
	const user = userEvent.setup();
	render(Component);

	const button = screen.getByRole('button');
	expect(button).toHaveTextContent(0);

	await user.click(button);
	expect(button).toHaveTextContent(1);
});
```

При написании тестов компонентов, которые включают двусторонние привязки, контекст или snippet props, лучше всего создать обертку-компонент для вашего конкретного теста и взаимодействовать с ней. @testing-library/svelte содержит несколько примеров.

## E2E тесты с использованием Playwright

E2E (сокращение от 'end to end') тесты позволяют тестировать ваше полное приложение глазами пользователя. В этом разделе используется Playwright в качестве примера, но вы также можете использовать другие решения, такие как Cypress или NightwatchJS.

Вы можете использовать Svelte CLI для настройки Playwright либо во время создания проекта, либо позже. Вы также можете настроить его с помощью npm init playwright. Дополнительно вы можете установить плагин для IDE, такой как расширение VS Code, чтобы иметь возможность выполнять тесты изнутри вашей IDE.

Если вы запустили npm init playwright или не используете Vite, вам может потребоваться настроить конфигурацию Playwright, чтобы сказать Playwright, что делать перед запуском тестов - в основном запустить ваше приложение на определенном порту. Например:

**playwright.config**

```js
const config = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
```

Теперь вы можете начать писать тесты. Они совершенно не знают о Svelte как о фреймворке, поэтому вы в основном взаимодействуете с DOM и пишете утверждения.

**tests/hello-world.spec**

```js
import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
});
```

## Дополнительные ресурсы для тестирования

### Testing Library Svelte

@testing-library/svelte - это простые и полные утилиты тестирования, которые поощряют хорошие практики тестирования. Они предоставляют утилиты для:

- Рендеринга компонентов
- Запросов к DOM ориентированным на пользователя способом
- Запуска событий для имитации пользовательских взаимодействий

### Mock Service Worker (MSW)

Для тестирования компонентов, которые делают API-вызовы, MSW может перехватывать сетевые запросы и возвращать mock-ответы.

### Тестирование Store

Svelte store можно тестировать независимо:

```js
import { get } from 'svelte/store';
import { writable } from 'svelte/store';

test('writable store', () => {
	const store = writable(0);
	
	expect(get(store)).toBe(0);
	
	store.set(1);
	expect(get(store)).toBe(1);
	
	store.update(n => n + 1);
	expect(get(store)).toBe(2);
});
```

### Тестирование Actions

Svelte actions можно тестировать, создавая mock DOM элементы:

```js
test('action', () => {
	const node = document.createElement('div');
	const destroy = myAction(node, 'parameter');
	
	// Test action behavior
	
	destroy?.();
});
```

### Тестирование Snippets

Snippets в Svelte 5 можно тестировать, рендеря их внутри тестового компонента, который принимает и рендерит snippet.
