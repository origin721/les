# Система миграций IndexedDB

В проекте реализована двухуровневая система миграций для IndexedDB, которая использует асинхронную загрузку кода миграций аналогично системе загрузки страниц.

## Архитектура системы

### 1. Миграции схемы (синхронные)
- **Файлы**: `src/indexdb/migrations/migration_v*.ts`
- **Выполнение**: Синхронно во время `onupgradeneeded` 
- **Назначение**: Создание/изменение схемы БД (object stores, индексы)

### 2. Миграции данных (асинхронные)
- **Файлы**: `src/indexdb/migrations/data_migrations/data_migration_*.ts`
- **Выполнение**: Асинхронно после инициализации приложения
- **Назначение**: Миграция существующих данных

## Как это работает

### Асинхронная загрузка миграций

```typescript
// Динамический импорт миграции
const migrationModule = await import(`./data_migrations/${migration.fileName}.js`);
const migrationFunction = migrationModule.default;
```

**Оптимизация**: Если у пользователя уже правильная версия данных, код миграций не загружается на клиент.

### Отслеживание версий

```typescript
// Версия данных хранится в localStorage
const currentVersion = getCurrentDataVersion(); // Из localStorage
const targetVersion = Math.max(...DATA_MIGRATION_REGISTRY.map(m => m.toVersion), 0);

if (currentVersion < targetVersion) {
  await runDataMigrations(currentVersion, targetVersion);
}
```

## Структура файлов

```
src/indexdb/migrations/
├── types.ts                    # Типы для системы миграций
├── index.ts                    # Система миграций схемы (будущее)
├── data_migrations.ts          # Система миграций данных
├── migration_v0_to_v1.ts      # Синхронная миграция схемы
└── data_migrations/
    └── data_migration_accounts_friends.ts  # Асинхронная миграция данных
```

## Создание новой миграции данных

### 1. Создайте файл миграции

```typescript
// src/indexdb/migrations/data_migrations/data_migration_example.ts
export default async function dataMigrationExample(): Promise<void> {
  console.log('🔄 Начинаем миграцию: описание миграции');
  
  // Ваша логика миграции
  // Может использовать indexdb_wrapper, back_store, etc.
}
```

### 2. Зарегистрируйте в реестре

```typescript
// src/indexdb/migrations/data_migrations.ts
export const DATA_MIGRATION_REGISTRY: MigrationInfo[] = [
  // ... существующие миграции
  {
    fromVersion: 1,
    toVersion: 2,
    description: 'Описание новой миграции',
    fileName: 'data_migration_example'
  },
];
```

### 3. Миграция выполнится автоматически

При следующем запуске приложения система автоматически:
1. Проверит версию данных в localStorage
2. Найдет необходимые миграции
3. Асинхронно загрузит код миграций
4. Выполнит их последовательно

## Преимущества системы

### 🚀 Производительность
- **Code splitting**: Код миграций загружается только при необходимости
- **Ленивая загрузка**: Аналогично страницам - загружается только нужное
- **Кеширование**: Если версия актуальна, загрузка не происходит

### 🔧 Гибкость
- **Асинхронность**: Миграции данных могут выполнять сложные операции
- **Модульность**: Каждая миграция - отдельный модуль
- **Расширяемость**: Легко добавлять новые миграции

### 📊 Мониторинг
- **Логирование**: Подробные логи выполнения миграций
- **Время выполнения**: Отслеживание производительности
- **Обработка ошибок**: Детальная диагностика проблем

## Интеграция в приложение

Система автоматически запускается при инициализации:

```typescript
// src/processes/app_processes_mount.ts
import { autoRunDataMigrations } from "../indexdb/migrations/data_migrations";

onMount(async () => {
  // Автоматическая миграция данных (асинхронная загрузка миграций)
  await autoRunDataMigrations();
  // ... остальная инициализация
});
```

## Примеры логов

```
🔄 Проверяем необходимость миграции данных: 0 -> 1
🚀 Найдено 1 миграций данных для выполнения
🔄 Загружаем миграцию данных: data_migration_accounts_friends
⚡ Выполняем миграцию данных: Миграция accounts для добавления поля friendsByIds
✅ Миграция данных data_migration_accounts_friends выполнена успешно
✅ Все миграции данных выполнены. Версия данных обновлена до 1
```

Таким образом, **да, миграции для базы импортируются асинхронно** (для данных), аналогично страницам проекта. Если у пользователя правильная версия данных, код миграций не загружается на клиент, что оптимизирует время загрузки приложения.
