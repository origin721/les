# VS Code Pro Tips - Прокачка редактора (обычно не нужно)

Этот файл содержит продвинутые советы по настройке VS Code для опытных разработчиков. Большинство из этих настроек не нужны для повседневной работы.

## Горячие клавиши

### Основные (которые стоит знать)
- `Ctrl/Cmd + Shift + P` - Командная палитра
- `Ctrl/Cmd + P` - Быстрый поиск файлов
- `Ctrl/Cmd + Shift + E` - Проводник файлов
- `Ctrl/Cmd + Shift + F` - Глобальный поиск
- `Ctrl/Cmd + Shift + G` - Git панель
- `Ctrl/Cmd + \`` - Терминал

### Продвинутые (редко используемые)
- `Ctrl/Cmd + Shift + L` - Выбрать все вхождения
- `Alt + Click` - Множественный курсор
- `Ctrl/Cmd + D` - Выбрать следующее вхождение
- `Ctrl/Cmd + K, Ctrl/Cmd + F` - Форматировать выделение
- `Ctrl/Cmd + K, M` - Выбрать язык файла
- `Ctrl/Cmd + K, V` - Предпросмотр Markdown
- `F12` - Перейти к определению
- `Alt + F12` - Посмотреть определение
- `Shift + F12` - Найти все ссылки

## Настройки settings.json (для гиков)

```json
{
  // Автосохранение
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  
  // Форматирование
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  
  // Мини-карта (обычно мешает)
  "editor.minimap.enabled": false,
  
  // Скрыть лишние элементы
  "workbench.activityBar.visible": false,
  "workbench.statusBar.visible": true,
  
  // Шрифт для кода (нужен Fira Code)
  "editor.fontFamily": "'Fira Code', Consolas, 'Courier New', monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  
  // Отступы
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": true,
  
  // Автодополнение
  "editor.suggest.insertMode": "replace",
  "editor.acceptSuggestionOnCommitCharacter": false,
  "editor.acceptSuggestionOnEnter": "on",
  
  // Файлы
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.trimFinalNewlines": true,
  
  // Исключения из поиска (ускоряет работу)
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.git": true,
    "**/coverage": true
  },
  
  // Git
  "git.autofetch": true,
  "git.confirmSync": false,
  
  // TypeScript
  "typescript.preferences.quoteStyle": "single",
  "typescript.suggest.autoImports": true,
  
  // Эмуляция Vim (для мазохистов)
  "vim.easymotion": true,
  "vim.hlsearch": true,
  "vim.useSystemClipboard": true
}
```

## Полезные расширения (не обязательно)

### Для веб-разработки
- **Prettier** - Форматирование кода
- **ESLint** - Линтер для JS/TS
- **Auto Rename Tag** - Переименование парных тегов
- **Bracket Pair Colorizer** - Цветные скобки
- **Live Server** - Локальный сервер для HTML

### Для продуктивности
- **GitLens** - Улучшенный Git
- **Path Intellisense** - Автодополнение путей
- **TODO Highlight** - Подсветка TODO комментариев
- **Better Comments** - Цветные комментарии

### Темы (дело вкуса)
- **One Dark Pro**
- **Material Theme**
- **Dracula**
- **Night Owl**
- **Cobalt2**

## Продвинутые фичи

### Сниппеты (Code Snippets)
Создайте свои сниппеты: `Ctrl/Cmd + Shift + P` → "Configure User Snippets"

Пример для JavaScript:
```json
{
  "Console log": {
    "prefix": "cl",
    "body": [
      "console.log('$1', $1);"
    ],
    "description": "Console log with variable name"
  }
}
```

### Multi-root Workspace
Можно открыть несколько проектов в одном окне:
```json
{
  "folders": [
    { "path": "./frontend" },
    { "path": "./backend" },
    { "path": "./shared" }
  ]
}
```

### Задачи (Tasks)
Создайте `.vscode/tasks.json` для автоматизации:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "npm start",
      "type": "shell",
      "command": "npm start",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

### Отладка (Debug)
Настройте `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## Комбо-команды для ниндзя

### Refactoring
- `F2` - Переименовать символ
- `Ctrl/Cmd + .` - Быстрые действия (Quick Fix)
- `Ctrl/Cmd + Shift + R` - Рефакторинг

### Навигация
- `Ctrl/Cmd + T` - Поиск по символам
- `Ctrl/Cmd + G` - Перейти к строке
- `Ctrl/Cmd + Shift + O` - Символы в файле
- `Alt + Left/Right` - Навигация назад/вперед

### Выделение
- `Ctrl/Cmd + L` - Выделить строку
- `Ctrl/Cmd + Shift + K` - Удалить строку
- `Alt + Up/Down` - Переместить строку
- `Shift + Alt + Up/Down` - Дублировать строку

## Скрытые настройки

### Производительность
```json
{
  "extensions.autoUpdate": false,
  "telemetry.enableTelemetry": false,
  "workbench.enableExperiments": false,
  "typescript.surveys.enabled": false,
  "npm.fetchOnlinePackageInfo": false
}
```

### Внешний вид
```json
{
  "window.titleBarStyle": "custom",
  "window.commandCenter": true,
  "workbench.layoutControl.enabled": false,
  "editor.scrollbar.vertical": "hidden",
  "editor.scrollbar.horizontal": "hidden"
}
```

---

**Важно**: Большинство этих настроек НЕ НУЖНЫ для нормальной работы. VS Code отлично работает из коробки. Используйте только то, что реально улучшает ваш workflow.

**Принцип**: Если не знаете зачем вам настройка - не используйте её.
