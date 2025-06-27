# 📖 API документация

## Local Back API

### Основные endpoints
- `/api/accounts` - управление аккаунтами
- `/api/friends` - управление друзьями  
- `/api/messages` - отправка сообщений
- `/api/rooms` - управление комнатами

### Методы шифрования
- `AES.encrypt(data, key)` - шифрование AES-256
- `Curve25519.generateKeys()` - генерация ключей
- `OpenPGP.sign(message)` - цифровая подпись

### LibP2P сервисы
- `createLibp2pNode()` - создание P2P узла
- `connectToPeer(peerId)` - подключение к пиру
- `sendMessage(peerId, data)` - отправка сообщения

## Подробности
См. `src/local_back/README.md` для полной документации API.
