# 📖 API документация

## Local Back API

### Основные endpoints
- `/api/accounts` - управление аккаунтами
- `/api/friends` - управление друзьями  
- `/api/messages` - отправка сообщений
- `/api/rooms` - управление комнатами

### Методы шифрования

#### Curve25519 (шифрование)

**`generate_keys_curve25519()`** - генерация пары ключей
```javascript
const keys = await generate_keys_curve25519();
// Возвращает: { privateKey: string, publicKey: string, keyType: string }
```

**`encrypt_curve25519({ receiverPublicKey, message })`** - простое шифрование
```javascript
const encrypted = await encrypt_curve25519({
  receiverPublicKey: "hex-строка публичного ключа получателя",
  message: "текст сообщения"
});
// Возвращает: hex-строку зашифрованного сообщения
```

**`decrypt_curve25519({ receiverPrivateKey, receiverPublicKey, cipherText })`** - расшифровка
```javascript
const decrypted = await decrypt_curve25519({
  receiverPrivateKey: "hex-строка приватного ключа получателя",
  receiverPublicKey: "hex-строка публичного ключа получателя", 
  cipherText: "hex-строка зашифрованного сообщения"
});
// Возвращает: расшифрованный текст или null при ошибке
```

**`encrypt_curve25519_verify({ receiverPublicKey, senderPrivateKey, message })`** - шифрование с аутентификацией
```javascript
const encrypted = await encrypt_curve25519_verify({
  receiverPublicKey: "hex-строка публичного ключа получателя",
  senderPrivateKey: "hex-строка приватного ключа отправителя",
  message: "текст сообщения"
});
// Возвращает: { nonce: string, cipherText: string }
```

**`decrypt_curve25519_verify({ receiverPrivateKey, senderPublicKey, cipherText, nonce })`** - расшифровка с проверкой
```javascript
const decrypted = await decrypt_curve25519_verify({
  receiverPrivateKey: "hex-строка приватного ключа получателя",
  senderPublicKey: "hex-строка публичного ключа отправителя",
  cipherText: "hex-строка зашифрованного сообщения",
  nonce: "hex-строка nonce"
});
// Возвращает: расшифрованный текст или null при ошибке
```

#### Ed25519 (цифровые подписи)

**`generate_keys_ed25519()`** - генерация ключей для подписи
```javascript
const keys = await generate_keys_ed25519();
// Возвращает: { privateKey: string, publicKey: string, keyType: string }
```

**`sign_ed25519({ privateKey, message })`** - создание цифровой подписи
```javascript
const signature = await sign_ed25519({
  privateKey: "hex-строка приватного ключа",
  message: "текст для подписи"
});
// Возвращает: hex-строку подписи или null при ошибке
```

**`verify_sign_ed25519({ publicKey, message, signature })`** - проверка подписи
```javascript
const isValid = await verify_sign_ed25519({
  publicKey: "hex-строка публичного ключа",
  message: "оригинальный текст",
  signature: "hex-строка подписи"
});
// Возвращает: true/false или null при ошибке
```

#### Использование в проекте
```javascript
import { 
  generate_keys_curve25519, 
  encrypt_curve25519, 
  decrypt_curve25519,
  generate_keys_ed25519,
  sign_ed25519,
  verify_sign_ed25519
} from '../core/crypt/libsodium';

// Пример: безопасная отправка сообщения
const senderKeys = await generate_keys_curve25519();
const receiverKeys = await generate_keys_curve25519();

const encrypted = await encrypt_curve25519({
  receiverPublicKey: receiverKeys.publicKey,
  message: "Секретное сообщение"
});

const decrypted = await decrypt_curve25519({
  receiverPrivateKey: receiverKeys.privateKey,
  receiverPublicKey: receiverKeys.publicKey,
  cipherText: encrypted
});
```

### Безопасно ли приложение?
- ~~AES-256~~ - устаревший, не поддерживается
- ~~OpenPGP~~ - устаревший, не поддерживается
- ~~ChaCha20-Poly1305~~ - менее безопасен чем Curve25519, не рекомендуется
- ~~RSA~~ - медленный и уязвимый, заменен на Ed25519

**✅ Используйте только:**
- **Curve25519** для шифрования
- **Ed25519** для подписей
- **libsodium** как криптографическую библиотеку

### LibP2P сервисы
- `createLibp2pNode()` - создание P2P узла
- `connectToPeer(peerId)` - подключение к пиру
- `sendMessage(peerId, data)` - отправка сообщения

## Подробности
См. `src/local_back/README.md` для полной документации API.
