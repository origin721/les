# Changelog v0.0.8 - 28.06.2025

## 🔧 Исправления и улучшения разработки

### ✅ Исправлены ошибки импорта в frontend
- **Проблема:** Отсутствовали утилитарные файлы для работы с Uint8Array
- **Решение:** Добавлены недостающие файлы в `front/src/core/`
  - `uint8ArrayToString.js` - преобразование Uint8Array в строку
  - `stringToUint8Array.js` - преобразование строки в Uint8Array

### 🚀 Успешный запуск dev сервера
- **Команда:** `npm run dev` в директории `front/`
- **Результат:** Сервер запущен на http://localhost:5173/
- **Статус:** Все импорты криптографических модулей работают корректно

## 🔍 Детали исправлений

### Ошибки которые были исправлены:
```
Failed to resolve import "../../uint8ArrayToString.js" from:
- src/core/crypt/libsodium-wrappers/decrypt_curve25519.js
- src/core/crypt/libsodium-wrappers/decrypt_curve25519_verify.js  
- src/core/crypt/libsodium-wrappers/decrypt_curve25519_from_pass.js
```

### Добавленные файлы:

#### `front/src/core/uint8ArrayToString.js`
```javascript
// @ts-check

// Функция для преобразования Uint8Array обратно в строку
export function uint8ArrayToString(uint8Array) {
  return new TextDecoder().decode(uint8Array);
}
```

#### `front/src/core/stringToUint8Array.js`
```javascript
// @ts-check

// Функция для преобразования строки в Uint8Array
export function stringToUint8Array(str) {
  return new TextEncoder().encode(str);
}
```

## 🎯 Результат

### ✅ Что работает:
- Frontend dev сервер запускается без ошибок
- Все криптографические модули корректно импортируют зависимости
- Hot Module Replacement (HMR) функционирует
- Приложение доступно на http://localhost:5173/

### ⚠️ Предупреждения (не критичные):
- Svelte 5 deprecation warnings для `on:click` → `onclick`
- TypeScript warnings об implicit 'any' типах в параметрах
- Accessibility warnings для form labels

## 🔧 Техническая информация

### Окружение:
- **Vite:** v6.3.5
- **Svelte:** 5 (с интегрированным HMR)
- **Порт:** 5173
- **Время запуска:** 877ms

### Архитектура:
- Утилитарные функции вынесены в отдельные модули
- ES6 модули с named exports
- Совместимость с TextEncoder/TextDecoder API
- Поддержка TypeScript через JSDoc комментарии

---

**Версия:** v0.0.8  
**Дата:** 28.06.2025  
**Тип:** Исправления (Bugfix)  
**Автор:** Система разработки  
**Теги:** #bugfix #frontend #imports #development #vite
