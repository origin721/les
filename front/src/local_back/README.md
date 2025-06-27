# Local Back API - Available Methods

## friends_libp2p_service(accId)
Manages friends and P2P connections for secure messaging:

**Friend Management:**
- addFriend(friendData) - добавить друга
- removeFriend(friendId) - удалить друга  
- getFriendById(friendId) - получить данные друга
- getFriendsList() - список всех друзей

**P2P Connections:**
- startLibp2pNode() - запуск P2P узла
- stopLibp2pNode() - остановка P2P узла
- connectToFriend(friendId) - подключение к другу
- disconnectFromFriend(friendId) - отключение от друга
- getConnectionStatus(friendId) - статус соединения

**Messaging:**
- sendMessage(friendId, message) - отправка сообщения
- broadcastToFriends(message) - отправка всем друзьям
- onMessageReceived(callback) - обработка входящих сообщений

**Network:**
- discoverPeers() - поиск узлов в сети
- getNetworkInfo() - информация о сети

## accounts_service(accId)
Управление аккаунтами и авторизацией:

**Account Operations:**
- createAccount(accountData) - создание аккаунта
- loginAccount(credentials) - вход в аккаунт
- logoutAccount() - выход из аккаунта
- deleteAccount(accountId) - удаление аккаунта
- updateAccountSettings(settings) - обновление настроек

**Key Management:**
- generateKeys() - генерация ключей
- exportKeys() - экспорт ключей
- importKeys(keyData) - импорт ключей
- rotateKeys() - смена ключей

**Session Management:**
- getCurrentSession() - текущая сессия
- validateSession() - проверка сессии
- refreshSession() - обновление сессии

## Общие принципы local_back API:
- Все сервисы возвращают factory функции
- Поддержка мульти-аккаунтов через accId
- Автоматическое шифрование данных
- In-memory кэширование для производительности
- Graceful fallback на IndexedDB
- Event-driven архитектура

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
    └── friends_libp2p_service.ts # P2P сервис друзей
```

## Использование

```typescript
import { accounts_service } from './modules/accounts_service';
import { friends_libp2p_service } from './modules/friends_libp2p_service';

// Работа с аккаунтами
await accounts_service.getList();
await accounts_service.onLogin({ body: { pass: 'password' } });

// Работа с друзьями через P2P
const friendsP2P = friends_libp2p_service({ accId: 'account-id' });
await friendsP2P.startLibp2pNode();
await friendsP2P.connectToFriend('friend-id');
