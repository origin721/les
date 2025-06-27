# Local Backend

Локальный backend для secure-message приложения. Обеспечивает управление состоянием и бизнес-логику на стороне клиента.

## Структура

```
src/local_back/
├── README.md                 # Этот файл
├── back_store.ts            # Центральное хранилище состояния
├── index.ts                 # Основная точка входа
├── middleware.ts            # Middleware для обработки запросов
├── constant/                # Константы
│   ├── EVENT_TYPES.ts
│   ├── PATHS.ts
│   └── index.ts
└── modules/                 # Модули сервисов
    ├── accounts_service.ts  # Сервис управления аккаунтами
    ├── friends_service.ts   # Сервис управления друзьями
    └── friends_libp2p_service.ts
```

## Компоненты

### back_store.ts
Центральное хранилище состояния приложения, содержит:
- `accounts_by_id`: Кэшированные аккаунты по ID
- `friendsLibp2p`: Кэшированные данные libp2p друзей

Ссылка: [back_store.ts](./back_store.ts)

### modules/accounts_service.ts
Сервис для работы с аккаунтами:
- Создание, обновление, удаление аккаунтов
- Логин/аутентификация
- Управление libp2p ключами
- Broadcast уведомления об изменениях

### modules/friends_service.ts
Сервис для работы с друзьями:
- Добавление новых друзей
- Получение списка друзей
- Удаление друзей
- Шифрование/дешифрование данных друзей

## Принципы работы

1. **Локальное хранилище**: Данные хранятся в IndexedDB с шифрованием
2. **Кэширование**: Часто используемые данные кэшируются в back_store
3. **Broadcast**: Изменения транслируются через BroadcastChannel
4. **Шифрование**: Данные шифруются с использованием curve25519

## Использование

```typescript
import { accounts_service } from './modules/accounts_service';
import { friends_service } from './modules/friends_service';

// Работа с аккаунтами
await accounts_service.getList();
await accounts_service.onLogin({ body: { pass: 'password' } });

// Работа с друзьями
await friends_service.getList(accountId);
await friends_service.add([friendEntity], accountId);
