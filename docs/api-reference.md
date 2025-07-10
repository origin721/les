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
```typescript
// front/src/api/shared_worker/
import { sharedWorkerAPI } from '@/api/shared_worker';

// Аккаунты
await sharedWorkerAPI.accounts.create(accountData);
await sharedWorkerAPI.accounts.getAll();

// Друзья
await sharedWorkerAPI.friends.add(friendData);
await sharedWorkerAPI.friends.remove(friendId);

// Табы
await sharedWorkerAPI.tabs.register(tabId);
await sharedWorkerAPI.tabs.broadcast(message);
```

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

- [Troubleshooting Guide](./troubleshooting.md)
- [IndexedDB Migrations](../front/docs/indexdb/migrations.md)
- [Backend API Guide](../back/docs/api-guide.md)
- [Frontend Architecture](../front/docs/ru/api.md)

---

*Последнее обновление: январь 2025*