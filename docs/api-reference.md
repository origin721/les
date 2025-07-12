# 🔌 API Reference

Комплексная документация по всем API системы Secure Message.

## 📋 Обзор архитектуры

```
Frontend (Svelte/TS)     Backend (Rust)
├── HTTP API            ├── Static files
├── WebRTC/P2P API      ├── SSE events  
├── IndexedDB API       └── WebSocket (планируется)
├── Crypto API
└── SharedWorker API
```

---

## 🦀 Backend API (Rust)

### Base URL
```
http://localhost:8080
```

### Эндпоинты

#### Статические файлы
```http
GET /*
```
Раздача файлов из папки `dist`

#### SPA Fallback
```http
GET /unknown-route
```
Возвращает `index.html` для роутинга SPA

#### События SSE
```http
GET /events
```
Server-Sent Events для real-time обновлений

---

## 🌐 Frontend API

### HTTP Client
```typescript
// front/src/api/http/
import { httpClient } from '@/api/http';

// POST событие
await httpClient.postEvent(eventData);
```

### WebRTC/P2P API
```typescript
// front/src/api/libp2p/
import { libp2pService } from '@/api/libp2p';

// Создание P2P соединения
const node = await createLibp2pNode(config);

// Сервис друзей
await friendService.addFriend(peerId);
await friendService.removeFriend(peerId);
```

### IndexedDB API
```typescript
// front/src/api/indexdb/
import { dbService } from '@/api/indexdb';

// CRUD операции
await dbService.create(table, data);
await dbService.read(table, id);
await dbService.update(table, id, data);
await dbService.delete(table, id);

// Миграции
await dbService.migrate(version);
```

### SSE API
```typescript
// front/src/api/sse/
import { createSSE } from '@/api/sse';

const sse = createSSE('/events');
sse.onMessage((data) => console.log(data));
```

### SharedWorker API

> 📚 **Полная документация**: [SharedWorker API Reference](./shared-worker-api.md)

Межвкладочное взаимодействие через SharedWorker с двумя основными методами:

#### fetch() - Запрос-ответ
```typescript
import { shared_worker_store } from '@/processes/shared_worker/shared_worker_store';
import { PATHS } from '@/local_back/constant/PATHS';

// Авторизация
await shared_worker_store.fetch({
  path: PATHS.LOGIN,
  body: { pass: "password" }
});

// Получение данных
const accounts = await shared_worker_store.fetch({
  path: PATHS.GET_ACCOUNTS
});

// Добавление друга
await shared_worker_store.fetch({
  path: PATHS.ADD_FRIENDS,
  body: {
    list: [friendEntity],
    myAccId: "account_id"
  }
});
```

#### subscribeToWorker() - Подписка на обновления
```typescript
// Подписка на счетчик активных вкладок
const unsubscribe = shared_worker_store.subscribeToWorker({
  payload: {
    path: PATHS.GET_ACTIVE_TABS_COUNT
  },
  callback: (data) => {
    console.log('Активных вкладок:', data.count);
  }
});

// Отписка (обязательно!)
unsubscribe();
```

#### Высокоуровневые API обертки
```typescript
// front/src/api/shared_worker/
import { accounts } from '@/api/shared_worker/accounts';
import { friends } from '@/api/shared_worker/friends';
import { tabs } from '@/api/shared_worker/tabs';

// Аккаунты
await accounts.login("password");
const accountList = await accounts.getList();

// Друзья
await friends.add(friendData, "myAccId");
const friendsList = await friends.getByAccountId("accId");

// Реактивный счетчик вкладок
const tabsCounter = tabs.createReactiveTabsCounter();
const unsubscribe = tabsCounter.subscribe((count) => {
  console.log('Вкладок:', count);
});
```

#### Основные операции

| Категория | Операции |
|-----------|----------|
| **Аккаунты** | LOGIN, GET_ACCOUNTS, ADD_ACCOUNTS, PUT_ACCOUNTS, DELETE_ACCOUNTS |
| **Друзья** | GET_FRIENDS, ADD_FRIENDS, PUT_FRIENDS, DELETE_FRIENDS, GET_FRIENDS_BY_ACCOUNT_ID |
| **Вкладки** | GET_ACTIVE_TABS_COUNT (fetch/subscribe) |
| **LibP2P** | GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P |

---

## 🔐 Криптографический API

### API ключи
```typescript
// front/src/core/local-storage/api-keys-storage.ts
import { apiKeysStorage } from '@/core/local-storage';

// Генерация ключа
const keyPair = await apiKeysStorage.generate();

// Сохранение
await apiKeysStorage.save(keyPair);

// Получение
const keys = await apiKeysStorage.getAll();
```

### Шифрование сообщений
```typescript
// Encrypt
const encrypted = await cryptoAPI.encrypt(message, publicKey);

// Decrypt  
const decrypted = await cryptoAPI.decrypt(encrypted, privateKey);
```

---

## 📊 Stores (State Management)

### API Keys Store
```typescript
// front/src/stores/api_keys_store.ts
import { apiKeysStore } from '@/stores';

// Подписка на изменения
apiKeysStore.subscribe((keys) => {
  console.log('Keys updated:', keys);
});

// Действия
await apiKeysStore.generateNew();
await apiKeysStore.addPartner(partnerKey);
```

---

## 🔧 Конфигурация

### Environment Variables
```bash
# Backend
RUST_LOG=debug
PORT=8080

# Frontend  
VITE_API_URL=http://localhost:8080
VITE_P2P_ENABLED=true
```

### Build Configuration
```typescript
// vite.config.ts
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
}
```

---

## 🚀 Примеры использования

### Полный цикл P2P сообщения
```typescript
// 1. Генерация ключей
const keyPair = await apiKeysStorage.generate();

// 2. Создание P2P соединения
const node = await createLibp2pNode();

// 3. Добавление друга
await friendService.addFriend(friendPeerId);

// 4. Отправка зашифрованного сообщения
const encrypted = await cryptoAPI.encrypt(message, friendPublicKey);
await node.pubsub.publish(topic, encrypted);

// 5. Сохранение в IndexedDB
await dbService.create('messages', {
  id: messageId,
  content: encrypted,
  timestamp: Date.now()
});
```

### Работа с событиями
```typescript
// Подключение к SSE
const sse = createSSE('/events');

// Обработка событий
sse.onMessage((event) => {
  switch(event.type) {
    case 'new_message':
      handleNewMessage(event.data);
      break;
    case 'friend_online':
      updateFriendStatus(event.data);
      break;
  }
});

// Отправка события на сервер
await httpClient.postEvent({
  type: 'user_action',
  data: { action: 'send_message' }
});
```

---

## 🛠️ Расширение API

### Добавление нового Backend эндпоинта
```rust
// back/src/modules/api/mod.rs
use axum::{Router, routing::get};

pub fn create_api_router() -> Router {
    Router::new()
        .route("/api/users", get(get_users))
        .route("/api/messages", post(send_message))
}
```

### Добавление нового Frontend сервиса
```typescript
// front/src/api/new-service/
export class NewService {
  async doSomething(data: any) {
    // Реализация
  }
}

export const newService = new NewService();
```

---

## 🔍 Debugging

### Backend logs
```bash
RUST_LOG=debug cargo run
```

### Frontend DevTools
```javascript
// В консоли браузера
window.debugAPI = {
  crypto: cryptoAPI,
  db: dbService,
  p2p: libp2pService
};
```

---

## 📚 Связанные документы

- **[SharedWorker API Reference](./shared-worker-api.md)** - Полная документация SharedWorker
- [Troubleshooting Guide](./troubleshooting.md)
- [IndexedDB Migrations](../front/docs/indexdb/migrations.md)
- [Backend API Guide](../back/docs/api-guide.md)
- [Frontend Architecture](../front/docs/ru/api.md)

---

*Последнее обновление: январь 2025*