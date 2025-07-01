import { beforeAll } from 'vitest'

beforeAll(async () => {
  // Инициализация libsodium для криптографических тестов
  try {
    const _sodium = await import('libsodium-wrappers')
    await _sodium.default.ready;
    (globalThis as any)._sodium = _sodium.default
  } catch (error) {
    console.warn('Failed to initialize libsodium:', error)
  }

  // Настройка для тестирования Svelte компонентов (только в jsdom окружении)
  if (typeof window !== 'undefined') {
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
  }

  // Полифил для Svelte 5
  if (typeof global === 'undefined') {
    globalThis.global = globalThis
  }
})
