# 🆘 Troubleshooting Guide

Руководство по решению частых проблем в **les.scripton.app**

---

## 🎯 Быстрые решения

### Приложение не загружается
```bash
# 1. Очистите кеш браузера
Ctrl+Shift+R (Chrome/Firefox)

# 2. Проверьте консоль браузера
F12 → Console → ищите ошибки

# 3. Перезапустите в приватном режиме
Ctrl+Shift+N (Chrome) / Ctrl+Shift+P (Firefox)
```

### База данных "зависла"
```bash
# Откройте консоль браузера (F12) и выполните:
localStorage.clear()
location.reload()

# Если не помогло:
# 1. Перейдите в Application → Storage
# 2. Удалите IndexedDB → main_les_store_v1
# 3. Перезагрузите страницу
```

### Ошибки миграций
```bash
# В настройках приложения (/settings):
# 1. Проверьте "Статистика миграций"
# 2. Если миграция зависла >10 минут - она сбросится автоматически
# 3. При критических ошибках используйте "Экстренный сброс БД"
```

---

## 🔧 Проблемы разработки

### Frontend (Svelte)

#### ❌ Ошибка: `npm run dev` не запускается
```bash
# Решение:
rm -rf node_modules package-lock.json
npm install
npm run dev

# Альтернатива:
npm run build && npm run preview
```

#### ❌ CSS стили не загружаются
```bash
# Проблема: CSS переменные без fallback
# Решение в CSS файле:
background-color: var(--les-bg-primary, #0a0a0a);
# НЕ:
background-color: var(--background-color);
```

#### ❌ Svelte компоненты не обновляются
```bash
# Очистите кеш Vite:
rm -rf .vite
npm run dev
```

### IndexedDB Issues

#### ❌ База данных недоступна
```javascript
// Диагностика в консоли браузера:
await indexedDB.databases()
// Должна показать main_les_store_v1

// Проверка состояния:
import { getDbState } from './src/indexdb/db_state_manager_v1/db_state_manager'
console.log(await getDbState('main_les_store_v1'))
```

#### ❌ Миграции не выполняются
```javascript
// Проверка блокировок:
// 1. Откройте /settings
// 2. Найдите "Статистика миграций"
// 3. Проверьте статус последней миграции

// Принудительный сброс (ОСТОРОЖНО - потеря данных):
localStorage.removeItem('db_state_main_les_store_v1')
indexedDB.deleteDatabase('main_les_store_v1')
location.reload()
```

#### ❌ Ошибка: "Version constraint not satisfied"
```bash
# Причина: Рассинхронизация версий
# Решение:
# 1. Проверьте ACCOUNTS_VERSION в constants.ts
# 2. Убедитесь что миграции выполнились
# 3. Проверьте версии данных в настройках
```

### Криптография

#### ❌ Ошибка: "crypto.subtle is undefined"
```bash
# Причина: HTTPS требуется для Web Crypto API
# Решение для разработки:
# 1. Используйте localhost (не 127.0.0.1)
# 2. Или настройте HTTPS в vite.config.ts:
server: {
  https: true
}
```

#### ❌ Тесты падают с криптографией
```bash
# Известная проблема - несовместимость с Vitest
# Временное решение:
# 1. Тесты отключены для криптографических функций
# 2. Тестируйте в браузере через /settings
# 3. Используйте ручное тестирование
```

---

## 🐳 Docker проблемы

### ❌ Контейнер не запускается
```bash
# Очистка Docker:
docker-compose down
docker system prune -f
docker-compose up --build

# Проверка логов:
docker-compose logs -f
```

### ❌ Порты заняты
```bash
# Проверить занятые порты:
lsof -i :5173  # Frontend
lsof -i :3000  # Event-stream
lsof -i :8080  # Backend

# Изменить порты в docker-compose.yml
```

---

## 🌐 Network Issues

### ❌ P2P соединение не работает
```bash
# Проверка WebRTC:
# 1. Откройте chrome://webrtc-internals/
# 2. Проверьте создание peer connections
# 3. Убедитесь что нет блокировки файрволом
```

### ❌ Event Stream отключается
```bash
# Проверка SSE:
# 1. Network tab в DevTools
# 2. Ищите /events endpoint
# 3. Проверьте статус соединения

# Перезапуск event-stream сервера:
cd event-stream
npm restart
```

---

## 🔍 Диагностика

### Получение отладочной информации

#### В браузере:
```javascript
// Добавьте к URL: ?debug=true
// Или в консоли:
localStorage.setItem('debug', 'true')
location.reload()

// Проверка состояния системы:
console.log('IndexedDB:', await indexedDB.databases())
console.log('LocalStorage:', { ...localStorage })
console.log('Crypto available:', !!window.crypto.subtle)
```

#### Экспорт логов:
```javascript
// В консоли браузера:
copy(JSON.stringify({
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString(),
  localStorage: { ...localStorage },
  indexedDB: await indexedDB.databases(),
  errors: window.errors || []
}, null, 2))
```

### Системная диагностика
```bash
# В настройках приложения (/settings):
# 1. ⏱️ Статистика миграций - время выполнения
# 2. 👥 Пользователи в системе - список аккаунтов  
# 3. 📊 Статистика Friends - состояние друзей
# 4. 🏠 Статистика Rooms - состояние комнат
```

---

## 🚨 Критические ошибки

### База данных повреждена
```bash
# ВНИМАНИЕ: Полная потеря данных!
# Только если ничего не помогает:

# 1. Экспорт данных (если возможно):
# Настройки → Экспорт данных

# 2. Полный сброс:
localStorage.clear()
indexedDB.deleteDatabase('main_les_store_v1')
indexedDB.deleteDatabase('db_state_manager_v1')
location.reload()

# 3. Импорт данных:
# Настройки → Импорт данных
```

### Приложение полностью не работает
```bash
# Проверочный список:
□ Браузер поддерживает IndexedDB?
□ Включены ли cookies и localStorage?
□ Нет ли блокировки JavaScript?
□ Доступен ли crypto.subtle? (нужен HTTPS)
□ Не блокирует ли антивирус/файрвол?

# Минимальные требования:
□ Chrome 90+, Firefox 88+, Safari 14+
□ HTTPS или localhost
□ Включенный JavaScript
□ Минимум 50MB свободного места
```

---

## 📞 Получение помощи

### Сообщить о проблеме:
1. **GitHub Issues**: [Создать issue](https://github.com/origin721/les/issues)
2. **Приложите диагностику**: Код из раздела "Экспорт логов"
3. **Опишите шаги**: Как воспроизвести проблему

### Перед созданием issue:
- ✅ Проверили ли решения выше?
- ✅ Попробовали ли в другом браузере?
- ✅ Очистили ли кеш?
- ✅ Проверили ли консоль на ошибки?

### Формат сообщения о проблеме:
```markdown
**Описание**: Что произошло
**Ожидаемое поведение**: Что должно было произойти  
**Шаги воспроизведения**: 
1. Откройте...
2. Нажмите...
3. Ошибка появляется...

**Браузер**: Chrome 120.0.0.0
**ОС**: Windows 11
**URL**: https://origin721.github.io/les/settings
**Консольные ошибки**: [приложите скриншот]
**Диагностические данные**: [JSON из "Экспорт логов"]
```

---

## 📚 Связанные документы

- **[🏗️ Архитектура](architecture.md)** - Как все устроено
- **[🗄️ IndexedDB Guide](../front/docs/indexdb/README.md)** - Работа с базой данных
- **[🔧 Development Guide](../front/README.md)** - Разработка и настройка
- **[🐳 Docker Setup](../docker/README.md)** - Контейнеризация

---

*Обновлено: январь 2025 | Если ваша проблема не решена - создайте issue!*