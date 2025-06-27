# API Ключи - Управление криптографическими ключами

## Обзор
Страница API ключей предоставляет интерфейс для управления криптографическими ключами Curve25519 в оперативной памяти.

## Структура файлов
```
src/pages/api_keys_page/
├── ui/
│   ├── ApiKeysPage.svelte          # Главная страница с табами
│   ├── ApiKeysPageGenerate.svelte  # Генерация новых ключей
│   ├── ApiKeysPageView.svelte      # Просмотр сохранённых ключей
│   └── ApiKeysPageAddPartner.svelte # Добавление ключей собеседника
└── index.ts                        # Экспорт компонентов

src/stores/api_keys_store.ts        # Централизованное хранилище ключей
```

## Маршрутизация
- **Маршрут:** `/api-keys` (ROUTES.API_KEYS)
- **Файл:** `src/routing/constants.ts` - константа маршрута
- **Роутер:** `src/routing/ui/RoutesView.svelte` - динамический импорт
- **Навигация:** `src/pages/home/ui/HomeScreen.svelte` - ссылка "API Ключи"

## Функциональность

### 1. Генерация ключей (ApiKeysPageGenerate)
- Создание пары ключей Curve25519
- Присвоение имени ключу
- Копирование в буфер обмена
- Показ/скрытие приватного ключа
- Сохранение в оперативной памяти

### 2. Просмотр ключей (ApiKeysPageView)
- Список всех сохранённых ключей
- Показ/скрытие приватных ключей
- Копирование ключей
- Удаление ключей
- Статистика

### 3. Ключи собеседника (ApiKeysPageAddPartner)
- Добавление публичных ключей собеседников
- Валидация формата ключей
- Вставка из буфера обмена
- Описание и метаданные
- Управление списком

## Store (apiKeysStore)
```typescript
interface KeyPair {
  id: string;
  publicKey: string;
  privateKey: string;
  name: string;
  createdAt: Date;
}

interface PartnerKey {
  id: string;
  publicKey: string;
  name: string;
  description?: string;
  createdAt: Date;
}
```

### Методы store:
- `addMyKey()` - добавить собственный ключ
- `removeMyKey()` - удалить собственный ключ
- `addPartnerKey()` - добавить ключ собеседника
- `removePartnerKey()` - удалить ключ собеседника
- `hasPartnerKey()` - проверка дублирования
- `clearAll()` - очистка всех данных
- `getStats()` - получение статистики

## Особенности безопасности
- Ключи хранятся только в оперативной памяти
- При перезагрузке страницы все данные теряются
- Приватные ключи скрыты по умолчанию
- Валидация формата ключей (base64)
- Предупреждения о безопасности

## Криптография
- Использует libsodium-wrappers через src/core/crypt/
- Алгоритм: Curve25519
- Функции: generate_keys_curve25519()
- Экспорт из: ../../../../event-stream/src/core/crypt/libsodium-wrappers

## UI/UX
- Табличная навигация (радио-кнопки)
- Tailwind CSS стили
- Responsive дизайн
- Информационные блоки
- Предупреждения и уведомления
- Копирование в буфер обмена
