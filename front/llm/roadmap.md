# 🗺️ Дорожная карта проекта Secure Message App

## 🎯 Основная концепция проекта
**Мульти-протокольный децентрализованный мессенджер** с единственным типом шифрования Curve25519.

## 🔒 Шифрование
- **Только Curve25519** - единый стандарт шифрования
- ~~GPG/OpenPGP~~ - убрано из проекта
- ~~AES-256~~ - заменено на Curve25519

## 📋 Текущий статус (v0.1.0)

### ✅ Готово:
- Базовая архитектура приложения
- Система аутентификации и аккаунтов
- Роутинг и навигация
- Базовая работа с IndexedDB
- UI компоненты и темы

### 🔄 В разработке:
- **Приоритет #1:** Завершение сервиса `createFriendsLibp2pService.ts`
- **Приоритет #2:** Экран Curve25519 (полное завершение)
- **Приоритет #3:** Экран блокировки во время миграции IndexedDB
- Миграция со старого `friends_libp2p_service.ts`

## 🚀 Этапы развития

### 📦 Этап 1: Основа (Текущий)
**Цель:** Добавление первого друга и базовый чат

#### 🎯 Задачи:
1. **Дописать `createFriendsLibp2pService.ts`** - основной сервис для друзей
2. **Завершить страницу `curve25519_page`** - единственное шифрование
3. **Добавление первого друга** - полный цикл от поиска до чата
4. **Чат 1-к-1** - первый протокол связи
5. **Удаление `friends_libp2p_service.ts`** - очистка старого кода

#### 📤 Результат этапа:
- Можно добавить друга через LibP2P
- Работает чат между двумя пользователями
- Шифрование Curve25519 работает

### 📦 Этап 2: Мульти-протокол (v0.2.0)
**Цель:** Расширение протоколов связи

#### 🎯 Задачи:
1. **Добавление 2-го протокола** - WebRTC или альтернатива
2. **Добавление 3-го протокола** - резервный канал
3. **Автоматическое переключение** между протоколами
4. **Оптимизация соединений** - выбор лучшего протокола

#### 📤 Результат этапа:
- Несколько способов связи с другом
- Устойчивость к сбоям сети
- Автоматическая оптимизация

### 📦 Этап 3: Групповые чаты (v0.3.0)
**Цель:** Чаты с несколькими участниками

#### 🎯 Задачи:
1. **Групповые комнаты** - создание и управление
2. **Мульти-протокол для групп** - все протоколы в группах
3. **Права доступа** - администрирование групп
4. **Шифрование групп** - Curve25519 для нескольких участников

### 📦 Этап 4: Расширенные функции (v0.4.0)
**Цель:** Дополнительные возможности

#### 🎯 Задачи:
1. **Обмен файлами** - через P2P
2. **Голосовые сообщения** - с шифрованием
3. **Статусы пользователей** - онлайн/оффлайн/занят
4. **Уведомления** - система оповещений

### 📦 Этап 5: Оптимизация (v0.5.0)
**Цель:** Производительность и стабильность

#### 🎯 Задачи:
1. **Оптимизация IndexedDB** - быстрое сохранение
2. **Сжатие данных** - экономия трафика
3. **Кэширование** - быстрая загрузка
4. **Тестирование** - полное покрытие тестами

## 🔮 Перспективы (v1.0+)
- **Мобильная версия** - PWA или нативное приложение
- **Плагины** - расширение функциональности
- **Интеграции** - связь с другими сервисами
- **Масштабирование** - поддержка больших сетей

## 🚨 Критические требования
1. **Только Curve25519** - никаких других алгоритмов шифрования
2. **Мульти-протокол** - обязательная поддержка нескольких способов связи
3. **Модульность** - каждый протокол как отдельный модуль
4. **Совместимость** - новые протоколы не должны ломать старые

## 📈 Метрики успеха
- **Этап 1:** Успешное добавление друга и отправка сообщения
- **Этап 2:** Работа при отключении одного из протоколов
- **Этап 3:** Группа из 5+ участников
- **Этап 4:** Обмен файлом размером 10MB+
- **Этап 5:** Время загрузки < 2 секунд

---
**Последнее обновление:** 27.06.2025
**Версия:** 0.1.0-dev
