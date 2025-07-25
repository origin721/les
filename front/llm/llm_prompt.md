# LLM Prompt - Главные выжимки

## 🏗️ Архитектура
- **Svelte 5 + TypeScript + Vite** - основной стек
- **Components** - ошибка в проекте (src/components/)
- **Widgets** - бизнес-компоненты (src/widgets/) 
- **Pages** - страницы с ui/stores/index.ts структурой
- **IndexedDB** - зашифрованное хранилище
- **LibP2P** - P2P соединения

## 🚫 Критические правила
- **СЛУШАТЬ ВНИМАТЕЛЬНО** что просит пользователь - не выдумывать лишнего
- **НЕ переписывать код "под ноль"** без веских причин
- **НЕ менять архитектуру** без согласования  
- **НЕ удалять функциональность** без необходимости
- Использовать **src/widgets/** а НЕ src/components/widgets/

## 📚 Обязательное чтение перед работой
- **[llm/rules.md](llm/rules.md)** - детальные правила кодирования
- **[llm/architecture.md](llm/architecture.md)** - полная архитектура  
- **[llm/svelte5.md](llm/svelte5.md)** - особенности Svelte 5
- **[src/local_back/README.md](src/local_back/README.md)** - API методы local_back

## 🔧 Быстрые команды  
```bash
npm i && npm run dev    # установка + разработка
npm run build          # сборка
```

## 📁 Ключевые папки
- **src/widgets/** - основные компоненты
- **src/local_back/** - бэкенд API  
- **src/indexdb/** - операции с БД
- **src/api/libp2p/** - P2P соединения
- **llm/** - документация для разработчиков

---
**Детали в соответствующих README и md файлах!**
