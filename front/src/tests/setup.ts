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

  // IndexedDB polyfill для тестов
  if (typeof window !== 'undefined' && !('indexedDB' in window)) {
    try {
      const FDBFactory = (await import('fake-indexeddb/lib/FDBFactory.js')).default
      const FDBKeyRange = (await import('fake-indexeddb/lib/FDBKeyRange.js')).default
      
      Object.defineProperty(window, 'indexedDB', {
        value: new FDBFactory(),
        writable: true
      })
      
      Object.defineProperty(window, 'IDBKeyRange', {
        value: FDBKeyRange,
        writable: true
      })
      
      // Также устанавливаем в globalThis для совместимости
      Object.defineProperty(globalThis, 'indexedDB', {
        value: new FDBFactory(),
        writable: true
      })
      
      Object.defineProperty(globalThis, 'IDBKeyRange', {
        value: FDBKeyRange,
        writable: true
      })
    } catch (error) {
      console.warn('Failed to setup IndexedDB polyfill:', error)
    }
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

    // Mock localStorage если его нет
    if (!window.localStorage) {
      const localStorageMock = {
        getItem: (key: string) => null,
        setItem: (key: string, value: string) => {},
        removeItem: (key: string) => {},
        clear: () => {}
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      })
    }
  }

  // Полифил для Svelte 5
  if (typeof global === 'undefined') {
    globalThis.global = globalThis
  }
})
