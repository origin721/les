# LLM Main - Основное (макс 20 строк)

> 📋 **Навигация:** [← Корневая LLM документация](../../llm/README.md) | [← Общая главная](../../llm/main.md) | [Архитектура →](architecture.md)

## 👤 ПЕРВЫЙ ВОПРОС
В какой роли работаем: разработчик? админ для развёртывания? тестер? другое?

## 📝 ОБЯЗАТЕЛЬНО
- НЕ писать больше 20 строк кода за раз
- Спрашивать разрешение прочитать файл если он по теме
- Идти пошагово с вопросами

## 🎯 Задача
Secure-message: P2P мессенджер на Svelte 5 + TypeScript + LibP2P

## 🏗️ Стек
- Frontend: Svelte 5 + TypeScript + Vite
- Storage: IndexedDB (зашифровано)  
- Network: LibP2P (P2P соединения)

## 📁 Структура
- `src/widgets/` - основные компоненты (НЕ components/widgets!)
- `src/pages/` - страницы (ui/stores/index.ts)
- `src/local_back/` - бэкенд API
- `src/indexdb/` - операции БД

## 🚫 Критично
- СЛУШАТЬ что просит пользователь
- НЕ переписывать код без причин
- НЕ менять архитектуру без согласования

## 📚 Детали в
- `llm/rules.md` - правила кодирования
- `llm/architecture.md` - полная архитектура
- `llm/svelte5.md` - особенности Svelte 5

## 🧭 Быстрая навигация
- **Общий контекст проекта** → [../../llm/README.md](../../llm/README.md) - индекс всей LLM документации
- **Проблемы с ИИ инструментами** → [../../llm/ai-limitations-and-lessons.md](../../llm/ai-limitations-and-lessons.md)
- **Backend разработка** → [../../llm/backend.md](../../llm/backend.md)
- **Общая архитектура** → [../../llm/architecture.md](../../llm/architecture.md)
