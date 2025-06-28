# 🏗️ Архитектура системы

```mermaid
graph TB
    subgraph "les.scripton.app Ecosystem"
        A[📱 Front - Svelte 5 App] 
        B[🦀 Back - Rust Server]
        C[🌊 Event-Stream - Node.js SSE]
    end
    
    A --> B
    A --> C
    B --> A
    C --> A
    
    subgraph "External"
        D[🌐 LibP2P Network]
        E[🔒 IndexedDB]
    end
    
    A --> D
    A --> E
```

## Компоненты

| Компонент | Технология | Назначение | Документация |
|-----------|------------|------------|--------------|
| **📱 Front** | Svelte 5 + TypeScript | Основное приложение с UI и P2P | **[front/README.md](../front/README.md)** |
| **🦀 Back** | Rust + Actix-web | Статический сервер для фронтенда | [back/](../back/) |
| **🌊 Event-Stream** | Node.js + SSE | Сервер событий для синхронизации | **[event-stream/README.md](../event-stream/README.md)** |

## 🛠️ Технологии

### Frontend (front/)
- **Framework:** Svelte 5 + TypeScript + Vite
- **Стили:** Tailwind CSS + кастомные темы
- **Шифрование:** Curve25519, Ed25519
- **БД:** IndexedDB с шифрованием
- **P2P:** LibP2P для децентрализации
- **Роутинг:** Кастомное решение

### Backend (back/)
- **Язык:** Rust
- **Framework:** Actix-web
- **Назначение:** Статический файловый сервер

### Event-Stream (event-stream/)
- **Язык:** Node.js (v22+)
- **Протокол:** Server-Sent Events (SSE)
- **Назначение:** Синхронизация и обмен событиями

---

**📚 Подробная техническая документация:** [llm/architecture.md](../llm/architecture.md)
