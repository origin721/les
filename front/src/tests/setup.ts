import { beforeAll } from 'vitest'

beforeAll(() => {
  // Настройка для тестирования Svelte компонентов
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })

  // Полифил для Svelte 5
  if (typeof global === 'undefined') {
    globalThis.global = globalThis
  }
})
