# 📖 API документация

## Local Back API

### Основные endpoints
- `/api/accounts` - управление аккаунтами
- `/api/friends` - управление друзьями  
- `/api/messages` - отправка сообщений
- `/api/rooms` - управление комнатами

### Методы шифрования
- `Curve25519.generateKeys()` - генерация ключей Curve25519
- `encrypt_curve25519()` - шифрование Curve25519
- `decrypt_curve25519()` - расшифровка Curve25519
- `encrypt_curve25519_verify()` - шифрование с верификацией
- `decrypt_curve25519_verify()` - расшифровка с верификацией
- `generate_keys_ed25519()` - генерация ключей Ed25519 для подписи
- `sign_ed25519()` - цифровая подпись Ed25519
- `verify_sign_ed25519()` - проверка подписи Ed25519

**Deprecated (не используются):**
- ~~AES-256~~ - устаревший, не поддерживается
- ~~OpenPGP~~ - устаревший, не поддерживается

### LibP2P сервисы
- `createLibp2pNode()` - создание P2P узла
- `connectToPeer(peerId)` - подключение к пиру
- `sendMessage(peerId, data)` - отправка сообщения

## Подробности
См. `src/local_back/README.md` для полной документации API.
