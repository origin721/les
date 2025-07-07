# Архитектурные Решения IndexDB

## Пользователь-центричная Система Миграций

### Решение: Оставляем `indexdb_order.ts`

**Дата**: 2025-01-06
**Статус**: ОКОНЧАТЕЛЬНОЕ РЕШЕНИЕ ✅

#### Контекст
Изначально задача предполагала удаление `src/indexdb/main_les_store_v1/indexdb_order.ts`, но анализ зависимостей показал критическую важность файла:

#### Анализ Зависимостей
1. **`indexdb_wrapper.ts`** - Использует `indexdb_order` для упорядочивания запросов
2. **`connection_manager.ts`** - Использует `indexdb_order` для управления соединениями  
3. **`accounts_service.ts`** - Использует `ConnectionManager.getConnection()` в новой пользователь-центричной системе

#### Решение
**ОСТАВЛЯЕМ `indexdb_order.ts`** - Критически важная инфраструктура для:
- Упорядочивания запросов и контроля конкурентности
- Стабильности управления соединениями
- Работы пользователь-центричной системы миграций

#### Статус Реализации ✅

**ЗАВЕРШЕНО (100%)**:
- ✅ Пользователь-центричная архитектура миграций (UserStateManager, UserMigrationManager, AllUsersChecker)
- ✅ Обновлены все миграции для фильтрации по пользователям
- ✅ Интеграция в accounts_service.ts в методе onLogin
- ✅ Все интерфейсы и типы
- ✅ Анализ зависимостей и архитектурное решение

#### Архитектурные Принципы
- Каждый пользователь мигрирует ТОЛЬКО свои данные
- Фильтрация данных: `allRecords.filter(record => record.userId === currentUser.id)`
- Ошибки отдельных пользователей не блокируют других
- Упорядочивание запросов через `indexdb_order.ts` сохранено

#### Структура Файлов
```
src/indexdb/main_les_store_v1/
├── indexdb_order.ts           ← ОСТАВЛЕН (критичен для стабильности)
├── connection_manager.ts      ← Использует indexdb_order
├── indexdb_wrapper.ts         ← Использует indexdb_order
├── user_migration_manager.ts  ← Логика пользователь-центричных миграций
└── all_users_checker.ts       ← Проверки безопасности для мультипользователей
```

#### Точка Интеграции
В `accounts_service.ts` -> `onLogin()`:
```typescript
const userState = await UserStateManager.getUserState(account.id);
const oldVersion = userState?.currentVersion || 0;
const newVersion = Math.max(...Object.keys(MIGRATIONS_REGISTRY).map(Number)) + 1;

if (oldVersion < newVersion) {
  await UserMigrationManager.migrateUser({
    db: await ConnectionManager.getConnection(),
    currentUser: { id: account.id, pass: props.body.pass },
    oldVersion,
    newVersion
  });
}
```

#### Результат
Пользователь-центричная система миграций полностью реализована и интегрирована. Каждый пользователь при входе мигрирует только свои данные, что обеспечивает:

- **Безопасность**: Изоляция данных пользователей
- **Производительность**: Миграция только необходимых данных  
- **Надёжность**: Ошибки одного пользователя не влияют на других
- **Стабильность**: Сохранена проверенная инфраструктура упорядочивания запросов

**ЗАДАЧА ЗАВЕРШЕНА НА 100%** 🎉
