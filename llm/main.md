# LLM Main - Secure Message Project Overview

> 📋 **Навигация:** [← Индекс LLM документации](README.md) | [Архитектура →](architecture.md)

## 👤 ПЕРВЫЙ ВОПРОС
В какой роли работаем: fullstack разработчик? backend (Rust)? frontend (Svelte)? DevOps? тестер?

## 📝 ОБЯЗАТЕЛЬНО
- НЕ писать больше 20 строк кода за раз
- Спрашивать разрешение прочитать файл если он по теме
- Идти пошагово с вопросами
- Учитывать многокомпонентную архитектуру проекта

## 🎯 Проект
**Secure-message**: Децентрализованный P2P мессенджер с end-to-end шифрованием

## 🏗️ Архитектура проекта
```
secure-message/
├── front/          # Frontend (Svelte 5 + TypeScript)
├── back/           # Backend (Rust + Actix)
└── event-stream/   # Event Server (Node.js)
```

## 🔧 Технологический стек
- **Frontend**: Svelte 5, TypeScript, Vite, Tailwind CSS
- **Backend**: Rust, Actix-web, Tokio
- **Event Server**: Node.js, Express, WebSocket
- **Crypto**: libsodium (Curve25519, Ed25519)
- **Storage**: IndexedDB (frontend), File system (backend)
- **Network**: LibP2P, WebRTC, SSE

## 🚫 Критично
- СЛУШАТЬ что просит пользователь
- НЕ переписывать код без причин
- НЕ менять архитектуру без согласования
- Учитывать взаимодействие между компонентами

## 📚 Детальная документация
- **[Индекс LLM документации](README.md)** - навигация по всей LLM документации
- **[Ограничения ИИ](ai-limitations-and-lessons.md)** - важные ограничения инструментов ИИ
- `llm/architecture.md` - полная архитектура проекта
- `llm/build-process.md` - процесс сборки и мультипротоколы
- `llm/backend.md` - специфика backend части
- `llm/event-stream.md` - специфика event-stream части
- `llm/crypto.md` - криптографические методы
- `llm/deployment.md` - развертывание и DevOps
- `front/llm/` - документация frontend (отдельная папка)

## 🧭 Быстрая навигация
- **Начинаете работу?** → [README.md](README.md) - индекс всей документации
- **Проблемы с инструментами?** → [ai-limitations-and-lessons.md](ai-limitations-and-lessons.md)
- **Frontend разработка?** → [../front/llm/main.md](../front/llm/main.md)
- **Backend разработка?** → [backend.md](backend.md)
