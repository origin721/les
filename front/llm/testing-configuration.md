# Конфигурация тестирования - Руководство для разработчиков и ИИ

## Обзор проблем и решений

### ❌ Проблемы, которые были решены:

1. **Deprecated `environmentMatchGlobs`** - старый способ настройки окружений
2. **Упавшие криптографические тесты** - работали в jsdom вместо node
3. **Лишние настройки coverage** - избыточные репортеры
4. **TypeScript ошибки** - неправильный синтаксис projects

### ✅ Финальная рабочая конфигурация:

```typescript
// vitest.config.ts - ЧИСТАЯ И РАБОЧАЯ ВЕРСИЯ
export default defineConfig({
  plugins: [svelte({ 
    hot: !process.env.VITEST,
    compilerOptions: {
      dev: !process.env.VITEST
    }
  })],
  test: {
    environment: 'jsdom',           // Основное окружение для UI тестов
    globals: true,                  // Глобальные функции тестирования
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',              // Быстрый провайдер coverage
      reporter: ['text', 'html'],   // Только нужные репортеры
      exclude: [                    // Исключения из coverage
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'build/'
      ]
    }
  },
  define: {
    global: 'globalThis'           // Полифилл для browser окружения
  },
  resolve: {
    conditions: ['browser']        // Резолв для browser модулей
  }
})
```

### 🔧 Workspace конфигурация для разных окружений:

```typescript
// vitest.workspace.ts - ДЛЯ РАЗДЕЛЕНИЯ ОКРУЖЕНИЙ
export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      include: ['src/**/*.test.{ts,js}', '!src/core/crypt/**/*.test.js'],
      name: 'browser',
      environment: 'jsdom',        // UI тесты в jsdom
    }
  },
  {
    test: {
      include: ['src/core/crypt/**/*.test.js'],
      name: 'crypto',
      environment: 'node',         // Криптографические тесты в node
      globals: true,
      setupFiles: ['./src/tests/setup.ts'],
    }
  }
])
```

## 🚨 ВАЖНЫЕ ПРАВИЛА для ИИ и разработчиков:

### 1. НЕ используйте deprecated функции:
- ❌ `environmentMatchGlobs` - deprecated
- ❌ `test.projects` с неправильным синтаксисом
- ✅ Используйте `vitest.workspace.ts` для разных окружений

### 2. Окружения тестов:
- **jsdom** - для UI компонентов Svelte
- **node** - для криптографических функций (libsodium)
- **happy-dom** - альтернатива jsdom (быстрее, но менее совместимая)

### 3. Coverage настройки:
- Используйте только `v8` провайдер (быстрый)
- Репортеры: `['text', 'html']` (достаточно)
- Обязательно исключайте: `node_modules/`, `src/tests/`, `**/*.d.ts`

### 4. Структура команд:
```json
{
  "test": "vitest",                    // Watch режим
  "test:run": "vitest run",           // Однократный запуск
  "test:coverage": "vitest --coverage", // С анализом покрытия
  "test:ui": "vitest --ui"            // Веб-интерфейс
}
```

## 🔍 Диагностика проблем:

### Если тесты падают:
1. Проверьте окружение (jsdom vs node)
2. Убедитесь что libsodium тесты запускаются в node
3. Проверьте setupFiles для инициализации

### Если TypeScript ошибки:
1. Проверьте `/// <reference types="vitest/config" />`
2. Убедитесь что используете правильные типы
3. Не смешивайте workspace и projects синтаксис

### Если coverage не работает:
1. Установите `@vitest/coverage-v8`
2. Проверьте exclude паттерны
3. Убедитесь что тесты действительно запускаются

## 📊 Результаты оптимизации:

- ✅ Все 19 тестов проходят успешно
- ✅ Убраны deprecated настройки
- ✅ Исправлены TypeScript ошибки
- ✅ Оптимизированы coverage настройки
- ✅ Разделены окружения для разных типов тестов

## 🎯 Для будущих изменений:

1. **НЕ трогайте** рабочую конфигурацию без веской причины
2. **Тестируйте** любые изменения на всех командах
3. **Документируйте** новые проблемы и решения
4. **Используйте** workspace для новых типов тестов
