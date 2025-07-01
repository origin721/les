//(window as any).location = { search: "" };
import { render } from "@testing-library/svelte";
import { expect, test } from "vitest";
//import App from "../App.svelte";

test("проверка, что в body нет текста", () => {
  //const { container } = render(App);
  //expect(container.textContent).toBe("");
});

// test('проверка на отображение svelte', () => {
// 	const { getByText } = render(App, {
// 		props: {
// 			name: 'world'
// 		}
// 	});
//
// 	expect(() => getByText('Hello world!')).not.toThrow();
// });
