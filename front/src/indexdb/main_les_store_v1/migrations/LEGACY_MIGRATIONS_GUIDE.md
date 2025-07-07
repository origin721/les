# 📦 Система Legacy Миграций - Руководство

## 🎯 Назначение системы

Система legacy миграций предназначена для оптимизации производительности приложения путем разделения старых и новых миграций:

- **Legacy миграции** (старые версии) - загружаются асинхронно только при необходимости
- **Актуальные миграции** (новые версии) - загружаются всегда

## 🏗️ Архитектура

### Файловая структура
```
migrations/
├── MIGRATIONS_REGISTRY.ts           # Основной реестр (новые версии)
├── LEGASY_MIGRATIONS_REGISTRY.ts    # Legacy реестр (старые версии)
└── migrations.ts                    # Логика с ленивой загрузкой
```

### Принцип работы
1. **MIN_CURRENT_VERSION** - граничная версия между legacy и актуальными миграциями
2. При `oldVersion < MIN_CURRENT_VERSION` → загружается legacy реестр
3. При `oldVersion >= MIN_CURRENT_VERSION` → используется только основной реестр

## ⚡ Преимущества

- **🚀 Быстрая загрузка**: Новые пользователи не загружают legacy код
- **📦 Оптимизация bundle**: Меньший размер основного приложения  
- **🔄 Обратная совместимость**: Полная поддержка старых версий
- **🎯 Ленивая загрузка**: Legacy загружается только при реальной необходимости

## 📋 Пример использования

### Сценарий 1: Новый пользователь (версия 0 → 2)
```typescript
// oldVersion = 0, newVersion = 2, MIN_CURRENT_VERSION = 0
// ✅ Используется только MIGRATIONS_REGISTRY (быстро)
// ❌ Legacy реестр НЕ загружается
```

### Сценарий 2: Старый пользователь (версия 3 → 8)
```typescript
// oldVersion = 3, newVersion = 8, MIN_CURRENT_VERSION = 7
// ✅ Загружается LEGACY_MIGRATIONS_REGISTRY асинхронно
// ✅ Объединяется с MIGRATIONS_REGISTRY
// ✅ Полное покрытие версий 3-8
```

## 🔧 Настройка

### Обновление границы legacy/current
```typescript
// В MIGRATIONS_REGISTRY.ts
export const MIN_CURRENT_VERSION = 7; // Все версии < 7 считаются legacy
```

### Добавление legacy миграции
```typescript
// В LEGASY_MIGRATIONS_REGISTRY.ts
export const LEGACY_MIGRATIONS_REGISTRY: Record<number, string> = {
  2: '2_old_feature',
  3: '3_deprecated_store', 
  4: '4_legacy_indexes',
  5: '5_old_accounts_format',
  6: '6_legacy_rooms',
};
```

### Добавление актуальной миграции
```typescript
// В MIGRATIONS_REGISTRY.ts  
export const MIGRATIONS_REGISTRY: Record<number, string> = {
  7: '7_new_feature',
  8: '8_optimize_performance',
  9: '9_add_settings_store',
};
```

## 🧪 API функции

### Синхронные (только основной реестр)
```typescript
// Быстрые функции для основного реестра
getAvailableMigrations()    // Только новые миграции
hasMigration(version)       // Проверка в основном реестре
getMaxVersion()             // Максимальная версия из основного реестра
```

### Асинхронные (включая legacy)  
```typescript
// Полные функции с legacy поддержкой
await getCombinedAvailableMigrations()  // Все миграции (legacy + current)
await hasCombinedMigration(version)     // Проверка во всех реестрах
await preloadMigrations(old, new)       // Автоматически определяет нужные реестры
```

## 🔄 Процесс миграции

1. **Определение потребности в legacy**
   ```typescript
   const needsLegacy = oldVersion < MIN_CURRENT_VERSION;
   ```

2. **Асинхронная загрузка legacy (если нужно)**
   ```typescript
   const legacyRegistry = await loadLegacyRegistry();
   ```

3. **Объединение реестров**
   ```typescript
   const combinedRegistry = { ...legacyRegistry, ...MIGRATIONS_REGISTRY };
   ```

4. **Предзагрузка модулей миграций**
   ```typescript
   const migrations = await preloadMigrations(oldVersion, newVersion);
   ```

5. **Выполнение миграций**
   ```typescript
   runSchemaMigrations(db, oldVersion, newVersion, migrations);
   await runDataMigrations(db, oldVersion, newVersion, migrations, dbName);
   ```

## 🎯 Стратегия перехода

### Шаг 1: Определите границу
```typescript
// Например, версии 1-6 устаревшие, 7+ актуальные
const MIN_CURRENT_VERSION = 7;
```

### Шаг 2: Перенесите legacy миграции
```typescript
// Из MIGRATIONS_REGISTRY.ts в LEGASY_MIGRATIONS_REGISTRY.ts
1: '1_old_accounts',
2: '2_legacy_rooms', 
// ... до версии 6
```

### Шаг 3: Очистите основной реестр
```typescript
// Оставьте только актуальные версии
7: '7_new_feature',
8: '8_modern_indexes',
```

## 📊 Мониторинг производительности

Система автоматически логирует:
- ✅ **Загрузка legacy реестра**: `Legacy реестр миграций загружен успешно`  
- ✅ **Создание объединенного реестра**: `Объединенный реестр создан`
- ⚡ **Оптимизация**: `Используем только основной реестр (legacy не требуется)`

## ⚠️ Важные замечания

1. **Имена файлов**: Legacy и актуальные миграции должны иметь уникальные имена файлов
2. **Версионирование**: Избегайте пересечения версий между реестрами
3. **Тестирование**: Проверьте все сценарии: только новые, только legacy, смешанные
4. **Backup**: Сохраните копии before/after при переносе миграций

---

*Обновлено: 7 января 2025 | Система legacy миграций v1.0*
