import { test, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import { theme, themes, toggleTheme } from "./theme";
import { KEYS } from "../core/local-storage/constants";

beforeEach(() => {
  // Очищаем localStorage перед каждым тестом
  localStorage.clear();
  // Сбрасываем состояние темы к первой теме
  theme.set(themes[0]);
});

test("должна быть тема по умолчанию", () => {
  expect(get(theme)).toBe(themes[0]);
});

test("тема должна меняться", () => {
  theme.set(themes[1]);
  expect(get(theme)).toBe(themes[1]);
});

test("toggleTheme должен переключать темы по кругу", () => {
  // Убеждаемся что начинаем с первой темы
  theme.set(themes[0]);

  toggleTheme();
  expect(get(theme)).toBe(themes[1]);

  toggleTheme();
  expect(get(theme)).toBe(themes[2]);

  toggleTheme();
  expect(get(theme)).toBe(themes[3]);

  toggleTheme();
  expect(get(theme)).toBe(themes[4]);

  toggleTheme();
  expect(get(theme)).toBe(themes[0]);
});
