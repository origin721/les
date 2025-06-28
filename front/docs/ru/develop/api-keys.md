# API Ключи - Управление криптографическими ключами

## Обзор
Страница API ключей предоставляет интерфейс для управления криптографическими ключами Curve25519 в оперативной памяти.

## Стиль дизайна (ориентир на auth)
При разработке новых страниц рекомендуется ориентироваться на стиль auth-страницы (`src/pages/auth/ui/AuthPage.svelte`) как хороший пример:

### Характеристики стиля auth:
- **Киберпанк дизайн** с тремя темами: cyberpunk, watchdogs, pixel
- **Глитч-эффекты** для логотипов и заголовков
- **Монокодировочные шрифты** (Courier New)
- **Неоновые акценты** и свечения через box-shadow
- **Терминальный интерфейс** с ASCII элементами
- **Адаптивная верстка** с медиа-запросами
- **CSS переменные** для темизации
- **Анимации** и плавные переходы

### Структура стилей auth:
```css
.theme-{$theme} {
  /* CSS переменные для цветов */
  --background-color: #0a0a0a;
  --text-color: #00ff00;
  --primary-color: #ff00ff;
  /* ... остальные переменные */
}
```

### Компоненты layout auth:
- Header с навигацией и переключателем тем
- Логотип с глитч-анимацией
- Основная форма по центру
- Footer с системной информацией

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

## Переиспользуемые Loading компоненты
В проекте доступны готовые loading компоненты для показа состояний загрузки:

### LoadingSequence.svelte
**Путь:** `src/widgets/LoadingSequence.svelte` (⚠️ Компоненты из components/ нужно перенести в widgets/)
**Описание:** Основной компонент последовательной загрузки с тремя фазами
```javascript
import LoadingSequence from "../../widgets/LoadingSequence.svelte";
```

**Особенности:**
- Случайная фаза загрузки (1-3)
- Полноэкранный overlay
- Готовые анимации для каждой фазы

### Индивидуальные фазы загрузки:
- `LoadingPhase1.svelte` - первая фаза
- `LoadingPhase2.svelte` - вторая фаза  
- `LoadingPhase3.svelte` - третья фаза

### Дополнительные спиннеры:
- `LoadingSpinner1.svelte`
- `LoadingSpinner2.svelte`
- `LoadingSpinner3.svelte`

### Экраны загрузки:
- `LoadingScreen1.svelte`
- `LoadingScreen2.svelte`
- `LoadingScreen3.svelte`

## Полезные утилиты для реализации

### Криптографические утилиты
```javascript
// Генерация ключей Curve25519
import { generate_keys_curve25519 } from "../../../core/crypt/libsodium";

// Основные крипто-функции
import { /* нужные функции */ } from "../../../core/crypt";
```

### Копирование в буфер
```javascript
import { copyTextToClipboard } from "../../../core/clip";

// Использование:
await copyTextToClipboard(text);
```

### Генерация ID и случайных значений
```javascript
import { uuid } from "../../../core/uuid";
import { getRandomInRange } from "../../../core/random/getRandomInRange";
import { generateRandomString } from "../../../core/random/generateRandomString";
```

### Вспомогательные функции
```javascript
import { sleep } from "../../../core/sleep";
import { jsonParse } from "../../../core/jsonParse";
import { toJson } from "../../../core/toJson";
```

### Svelte утилиты
```javascript
import { writableToState } from "../../../core/svelte_default/runs/writableToState.svelte";
```

### Роутинг и навигация
```javascript
import { Link, ROUTES } from "../../../routing";
```

### Стили и темы
```javascript
import { theme } from "../../../stores/theme";
import ThemeSwitcher from "../../../widgets/ThemeSwitcher.svelte";

// CSS файлы тем
import "../../../styles/cyberpunk.css";
import "../../../styles/watchdogs.css";
import "../../../styles/pixel.css";
```

## UI/UX
- Табличная навигация (радио-кнопки)
- Tailwind CSS стили
- Responsive дизайн
- Информационные блоки
- Предупреждения и уведомления
- Копирование в буфер обмена
