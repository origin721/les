# Testing
On this page
Testing
Unit and integration testing using Vitest
E2E tests using Playwright
Testing helps you write and maintain your code and guard against regressions. Testing frameworks help you with that, allowing you to describe assertions or expectations about how your code should behave. Svelte is unopinionated about which testing framework you use — you can write unit tests, integration tests, and end-to-end tests using solutions like Vitest, Jasmine, Cypress and Playwright.

## Unit and integration testing using Vitest
Unit tests allow you to test small isolated parts of your code. Integration tests allow you to test parts of your application to see if they work together. If you're using Vite (including via SvelteKit), we recommend using Vitest. You can use the Svelte CLI to setup Vitest either during project creation or later on.

To setup Vitest manually, first install it:

```bash
npm install -D vitest
```

Then adjust your vite.config.js:

**vite.config**

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

If loading the browser version of all your packages is undesirable, because (for example) you also test backend libraries, you may need to resort to an alias configuration

You can now write unit tests for code inside your .js/.ts files:

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

## Using runes inside your test files
Since Vitest processes your test files the same way as your source files, you can use runes inside your tests as long as the filename includes .svelte:

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

If the code being tested uses effects, you need to wrap the test inside $effect.root:

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

## Component testing
It is possible to test your components in isolation using Vitest.

Before writing component tests, think about whether you actually need to test the component, or if it's more about the logic inside the component. If so, consider extracting out that logic to test it in isolation, without the overhead of a component

To get started, install jsdom (a library that shims DOM APIs):

```bash
npm install -D jsdom
```

Then adjust your vite.config.js:

**vite.config**

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

After that, you can create a test file in which you import the component to test, interact with it programmatically and write expectations about the results:

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

While the process is very straightforward, it is also low level and somewhat brittle, as the precise structure of your component may change frequently. Tools like @testing-library/svelte can help streamline your tests. The above test could be rewritten like this:

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

When writing component tests that involve two-way bindings, context or snippet props, it's best to create a wrapper component for your specific test and interact with that. @testing-library/svelte contains some examples.

## E2E tests using Playwright
E2E (short for 'end to end') tests allow you to test your full application through the eyes of the user. This section uses Playwright as an example, but you can also use other solutions like Cypress or NightwatchJS.

You can use the Svelte CLI to setup Playwright either during project creation or later on. You can also set it up with npm init playwright. Additionally, you may also want to install an IDE plugin such as the VS Code extension to be able to execute tests from inside your IDE.

If you've run npm init playwright or are not using Vite, you may need to adjust the Playwright config to tell Playwright what to do before running the tests - mainly starting your application at a certain port. For example:

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

You can now start writing tests. These are totally unaware of Svelte as a framework, so you mainly interact with the DOM and write assertions.

**tests/hello-world.spec**

```js
import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
});
