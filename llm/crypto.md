# 🔐 Криптографические методы Secure Message

## 📚 Библиотеки
- **libsodium**: Основная криптографическая библиотека
- **Curve25519**: Эллиптическая криптография для шифрования
- **Ed25519**: Цифровые подписи
- **ChaCha20-Poly1305**: Симметричное шифрование

## 🔑 Методы Curve25519 (Шифрование)

### ✅ Рекомендуемые методы (с проверкой подписи)
```typescript
// Генерация ключей
generate_keys_curve25519() → {privateKey, publicKey, keyType}

// Шифрование с проверкой подписи (БЕЗОПАСНО)
encrypt_curve25519_verify({
  receiverPublicKey: string,
  senderPrivateKey: string,
  message: string
}) → {ciphertext, nonce, ephemeralPublicKey}

// Расшифровка с проверкой подписи (БЕЗОПАСНО)
decrypt_curve25519_verify({
  receiverPrivateKey: string,
  senderPublicKey: string,
  ciphertext: string,
  nonce: string,
  ephemeralPublicKey: string
}) → string
```

### ⚠️ Простые методы (без проверки подписи)
```typescript
// Шифрование БЕЗ проверки подписи (менее безопасно)
encrypt_curve25519({
  receiverPublicKey: string,
  message: string
}) → {ciphertext, nonce, ephemeralPublicKey}

// Расшифровка БЕЗ проверки подписи
decrypt_curve25519({
  receiverPrivateKey: string,
  ciphertext: string,
  nonce: string,
  ephemeralPublicKey: string
}) → string
```

## ✍️ Методы Ed25519 (Цифровые подписи)

```typescript
// Генерация ключей для подписи
generate_keys_ed25519() → {privateKey, publicKey}

// Создание подписи
sign_ed25519({
  privateKey: string,
  message: string
}) → string

// Проверка подписи
verify_sign_ed25519({
  publicKey: string,
  message: string,
  signature: string
}) → boolean
```

## 🔒 Методы с паролем

```typescript
// Генерация ключей из пароля
generate_keys_curve25519_from_password({
  password: string,
  salt?: string
}) → {privateKey, publicKey}

// Шифрование с паролем
encrypt_curve25519_from_pass({
  pass: string,
  message: string
}) → string

// Расшифровка с паролем
decrypt_curve25519_from_pass({
  pass: string,
  cipherText: string
}) → string
```

## 🛡️ Правила безопасности

### 1. Всегда используй методы с `_verify`
```typescript
// ✅ ПРАВИЛЬНО - с проверкой подписи
const encrypted = await encrypt_curve25519_verify({...});
const decrypted = await decrypt_curve25519_verify({...});

// ❌ НЕПРАВИЛЬНО - без проверки подписи
const encrypted = await encrypt_curve25519({...});
```

### 2. Храни приватные ключи безопасно
- Никогда не передавай приватные ключи по сети
- Шифруй приватные ключи перед сохранением в IndexedDB
- Используй пароли для дополнительной защиты

### 3. Проверяй подписи
```typescript
// Всегда проверяй подписи важных сообщений
const isValid = await verify_sign_ed25519({
  publicKey: senderPublicKey,
  message: originalMessage,
  signature: receivedSignature
});

if (!isValid) {
  throw new Error('Подпись недействительна!');
}
```

## 🏗️ Архитектурные паттерны

### Паттерн "Двойное шифрование"
```typescript
// 1. Шифруем сообщение с проверкой подписи
const encrypted = await encrypt_curve25519_verify({
  receiverPublicKey,
  senderPrivateKey,
  message
});

// 2. Подписываем зашифрованное сообщение
const signature = await sign_ed25519({
  privateKey: senderSigningKey,
  message: JSON.stringify(encrypted)
});

// Результат: {encrypted, signature}
```

### Паттерн "Ключи сессии"
```typescript
// Генерируем временные ключи для сессии
const sessionKeys = await generate_keys_curve25519();

// Шифруем сессионный ключ основным ключом
const encryptedSessionKey = await encrypt_curve25519_verify({
  receiverPublicKey: permanentPublicKey,
  senderPrivateKey: permanentPrivateKey,
  message: sessionKeys.privateKey
});

// Используем сессионные ключи для сообщений
```

## 📁 Структура в проекте

### Frontend
```
src/core/crypt/
├── libsodium.ts          # Экспорт методов
└── (импорт из event-stream)

event-stream/src/core/crypt/libsodium-wrappers/
├── index.js              # Экспорт всех методов
├── generate_keys_curve25519.js
├── encrypt_curve25519.js
├── encrypt_curve25519_verify.js
├── decrypt_curve25519.js
├── decrypt_curve25519_verify.js
├── generate_keys_ed25519.js
├── sign_ed25519.js
└── verify_sign_ed25519.js
```

## 🔧 Использование в компонентах

### В страницах шифрования
```typescript
import {
  generate_keys_curve25519,
  encrypt_curve25519_verify,
  decrypt_curve25519_verify
} from '../../../core/crypt';

// Генерация ключей при загрузке страницы
onMount(async () => {
  const keys = await generate_keys_curve25519();
  // Сохранить в store или state
});
```

### В IndexedDB
```typescript
// Шифрование перед сохранением
const encryptedData = await encrypt_curve25519_from_pass({
  pass: userPassword,
  message: JSON.stringify(sensitiveData)
});

// Сохранение в IndexedDB
await indexdb_wrapper.add('encrypted_data', {
  id: dataId,
  data: encryptedData
});
```

## ⚠️ Частые ошибки

1. **Использование простых методов для важных данных**
2. **Передача приватных ключей по сети**
3. **Отсутствие проверки подписей**
4. **Хранение ключей в открытом виде**
5. **Повторное использование nonce**

## 🎯 Best Practices

1. Всегда используй `_verify` методы
2. Генерируй новые ключи для каждой сессии
3. Проверяй все подписи
4. Шифруй данные перед сохранением
5. Используй сильные пароли для ключей
