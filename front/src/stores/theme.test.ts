import { test, expect } from "vitest";
import { get } from "svelte/store";
import { theme, themes, toggleTheme } from "./theme";

test("должна быть тема по умолчанию", () => {
  expect(get(theme)).toBe(themes[0]);
});

test("тема должна меняться", () => {
  theme.set(themes[1]);
  expect(get(theme)).toBe(themes[1]);
});

test("toggleTheme должен переключать темы по кругу", () => {
  theme.set(themes[0]);

  toggleTheme();
  expect(get(theme)).toBe(themes[1]);

  toggleTheme();
  expect(get(theme)).toBe(themes[2]);

  toggleTheme();
  expect(get(theme)).toBe(themes[0]);
});
