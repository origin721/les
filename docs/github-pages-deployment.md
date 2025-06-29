# 🚀 GitHub Pages Deployment

Этот документ описывает настройку автоматического деплоя фронтенда на GitHub Pages с помощью GitHub Actions в проекте secure-message.

> **⚠️ Важно**: Текущий workflow содержит критические ошибки. См. [анализ проблем](../wiki-base-technologies/github-actions/project-integration-summary.md) и [руководство по исправлению](../wiki-base-technologies/github-actions/PRACTICAL_GUIDE.md).

## 📁 Структура файлов

```
.github/
└── workflows/
    └── gh-pages-deploy.yml  # ❌ Workflow для автоматического деплоя (требует исправления)
wiki-base-technologies/
└── github-actions/         # 📚 Полная документация по GitHub Actions
    ├── INDEX.md            # Центральный индекс документации
    ├── README.md           # Полное руководство по GitHub Actions
    ├── peaceiris-gh-pages.md # Детальное руководство по peaceiris action
    ├── project-integration-summary.md # Анализ текущих проблем
    ├── PRACTICAL_GUIDE.md  # Пошаговые инструкции по исправлению
    └── QUICK_REFERENCE.md  # Быстрый справочник
```

## ⚙️ Настройка GitHub Pages

### 1. Включение GitHub Pages в репозитории

1. Перейдите в **Settings** вашего репозитория
2. Найдите раздел **Pages** в левом меню
3. В разделе **Source** выберите **Deploy from a branch**
4. Выберите ветку **gh-pages** и папку **/ (root)**
5. Нажмите **Save**

> **💡 Совет**: После первого успешного деплоя GitHub Pages может настроиться автоматически.

### 2. Настройка permissions для GitHub Actions

В **Settings** → **Actions** → **General**:
- Убедитесь, что **Actions permissions** разрешены
- В разделе **Workflow permissions** выберите **Read and write permissions**
- Включите **Allow GitHub Actions to create and approve pull requests**

### 3. Проверка ограничений GitHub Pages

GitHub Pages имеет следующие ограничения:
- **Размер репозитория**: до 1 GB
- **Размер файла**: до 100 MB
- **Пропускная способность**: 100 GB в месяц
- **Количество сборок**: 10 в час

Подробнее: [GitHub Pages usage limits](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#usage-limits)

## 🔧 Конфигурация

### ❌ Текущий проблемный workflow

```yaml
# ВНИМАНИЕ: Этот workflow содержит ошибки!
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: cd front              # ❌ Не работает для следующих команд
      - run: npm i                 # ❌ Выполняется в корневой директории
      - run: npm run build         # ❌ Выполняется в корневой директории
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist      # ❌ Неправильный путь
```

### ✅ Исправленный workflow

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:  # Возможность запуска вручную

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # ✅ Необходимо для push в gh-pages
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: front/package-lock.json
          
      - name: Install dependencies
        run: cd front && npm ci  # ✅ Правильная смена директории
          
      - name: Build
        run: cd front && npm run build  # ✅ Правильная смена директории
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        if: github.ref == 'refs/heads/main'  # ✅ Условное выполнение
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./front/dist  # ✅ Правильный путь
```

> **📖 Подробнее**: См. [практическое руководство](../wiki-base-technologies/github-actions/PRACTICAL_GUIDE.md) для пошаговых инструкций по исправлению.

### Vite конфигурация (`front/vite.config.ts`)

```typescript
export default defineConfig({
  // Настройка base для GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/secure-message/' : '/',
  // ... остальная конфигурация
})
```

## 🌐 URL доступа

После успешного деплоя сайт будет доступен по адресу:
- **Стандартный GitHub Pages**: `https://username.github.io/secure-message/`
- **Кастомный домен**: Настраивается в Settings → Pages

### Настройка кастомного домена

1. **Добавить CNAME файл** в корень сайта:
   ```yaml
   # В workflow добавить
   - uses: peaceiris/actions-gh-pages@v4
     with:
       github_token: ${{ secrets.GITHUB_TOKEN }}
       publish_dir: ./front/dist
       cname: your-domain.com
   ```

2. **Настроить DNS записи** у регистратора домена:
   ```
   # Для поддомена (www.example.com)
   CNAME www username.github.io

   # Для корневого домена (example.com)
   A @ 185.199.108.153
   A @ 185.199.109.153
   A @ 185.199.110.153
   A @ 185.199.111.153
   ```

3. **Включить HTTPS** в Settings → Pages (рекомендуется)

Подробнее: [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

## 🚀 Процесс деплоя

1. **Автоматический деплой**: При каждом пуше в ветку `main`
2. **Ручной деплой**: Через вкладку **Actions** → **Deploy to GitHub Pages** → **Run workflow**

### Этапы деплоя:

1. **Checkout** - Скачивание кода
2. **Setup Node.js** - Установка Node.js 18 с кешированием npm
3. **Install dependencies** - Установка зависимостей (`npm ci`)
4. **Build** - Сборка проекта (`npm run build`)
5. **Deploy** - Публикация в ветку `gh-pages`

## 🔍 Мониторинг

- **GitHub Actions**: Вкладка **Actions** в репозитории
- **Deployment status**: Settings → Pages показывает статус последнего деплоя
- **Logs**: Детальные логи доступны в каждом запуске workflow

## ⚠️ Важные моменты

### Base URL в Vite конфигурации
```typescript
// front/vite.config.ts
export default defineConfig({
  // Для GitHub Pages с именем репозитория
  base: process.env.NODE_ENV === 'production' ? '/secure-message/' : '/',
  
  // Для кастомного домена
  // base: '/',
  
  // ... остальная конфигурация
})
```

### Ветки и события
- Workflow настроен на ветку `main`
- Если используете `master`, измените в файле workflow
- Поддерживается ручной запуск через `workflow_dispatch`

### Кеширование и оптимизация
- npm зависимости кешируются для ускорения сборки
- Путь к `package-lock.json`: `front/package-lock.json`
- Используется Node.js 20 для лучшей производительности

### Безопасность
- Используется встроенный `GITHUB_TOKEN` (рекомендуется)
- Минимальные права доступа: `contents: write`
- Условное выполнение только для main ветки

## 🛠️ Troubleshooting

### Критические проблемы в текущем workflow

| Проблема | Симптом | Решение |
|----------|---------|---------|
| Неправильная смена директории | `npm: command not found` | Использовать `cd front && npm ci` |
| Неверный путь сборки | `No such file or directory: ./dist` | Изменить на `./front/dist` |
| Отсутствие permissions | `Resource not accessible by integration` | Добавить `permissions: contents: write` |
| Неоптимальные команды | Нестабильная сборка | Заменить `npm i` на `npm ci` |

### Общие проблемы GitHub Pages

#### Проблема: 404 ошибка на GitHub Pages
**Причины и решения**:
- Неправильная настройка `base` в `vite.config.ts`
- Отсутствует `index.html` в корне сборки
- Неправильно настроена ветка в Settings → Pages

#### Проблема: Workflow не запускается
**Проверить**:
- Синтаксис YAML файла
- Permissions в Settings → Actions → General
- Правильность имени ветки (`main` vs `master`)

#### Проблема: Ошибка сборки
**Отладка**:
1. Проверить локальную сборку: `cd front && npm run build`
2. Включить debug логи в workflow
3. Проверить логи в Actions tab

> **📖 Подробное руководство**: См. [практическое руководство по устранению проблем](../wiki-base-technologies/github-actions/PRACTICAL_GUIDE.md#устранение-проблем)

## 📚 Дополнительные ресурсы

### Документация проекта
- **[GitHub Actions - Центральный индекс](../wiki-base-technologies/github-actions/INDEX.md)** - Навигация по всей документации
- **[Практическое руководство](../wiki-base-technologies/github-actions/PRACTICAL_GUIDE.md)** - Пошаговые инструкции
- **[Быстрый справочник](../wiki-base-technologies/github-actions/QUICK_REFERENCE.md)** - Команды и решения
- **[Анализ проблем](../wiki-base-technologies/github-actions/project-integration-summary.md)** - Детальный анализ текущих проблем

### Официальная документация
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
- [Vite Static Deploy Guide](https://vitejs.dev/guide/static-deploy.html)

### Полезные инструменты
- [YAML Syntax Checker](https://yaml-online-parser.appspot.com/)
- [GitHub Status](https://www.githubstatus.com/)
- [GitHub CLI](https://cli.github.com/) для управления workflow

---

**🚨 Следующий шаг**: Исправить текущий workflow согласно [практическому руководству](../wiki-base-technologies/github-actions/PRACTICAL_GUIDE.md)
