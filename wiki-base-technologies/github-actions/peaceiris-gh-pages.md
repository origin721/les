# peaceiris/actions-gh-pages - Подробное руководство

## Обзор

`peaceiris/actions-gh-pages` - это GitHub Action для автоматического деплоя статических файлов на GitHub Pages. Поддерживает все популярные генераторы статических сайтов (Hugo, MkDocs, Gatsby, mdBook, Next, Nuxt и др.).

## Основные возможности

- ✅ Поддержка всех платформ (Ubuntu, macOS, Windows)
- ✅ Три типа аутентификации (GITHUB_TOKEN, Deploy Key, Personal Token)
- ✅ Поддержка GitHub Enterprise Server (>= 2.22.6)
- ✅ Гибкая настройка публикации
- ✅ Поддержка пользовательских доменов (CNAME)
- ✅ Фильтрация файлов для публикации

## Быстрый старт

### Минимальная конфигурация

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Параметры конфигурации

### Обязательные параметры

#### Аутентификация (один из трех)
```yaml
# Вариант 1: GitHub Token (рекомендуется)
github_token: ${{ secrets.GITHUB_TOKEN }}

# Вариант 2: Deploy Key
deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}

# Вариант 3: Personal Access Token
personal_token: ${{ secrets.PERSONAL_TOKEN }}
```

#### Директория для публикации
```yaml
publish_dir: ./dist  # По умолчанию: public
```

### Дополнительные параметры

#### Целевая ветка
```yaml
publish_branch: gh-pages  # По умолчанию: gh-pages
```

#### Поддиректория назначения
```yaml
destination_dir: subdirectory  # Публикация в поддиректорию
```

#### Внешний репозиторий
```yaml
external_repository: username/another-repo
```

#### Пользовательский домен
```yaml
cname: example.com
```

#### Исключение файлов
```yaml
exclude_assets: '.github,node_modules,*.log'
```

#### Сохранение существующих файлов
```yaml
keep_files: true  # По умолчанию: false
```

#### Разрешение пустых коммитов
```yaml
allow_empty_commit: true  # По умолчанию: false
```

#### Включение Jekyll
```yaml
enable_jekyll: true  # По умолчанию: false
```

#### Force orphan (только последний коммит)
```yaml
force_orphan: true  # По умолчанию: false
```

#### Настройка Git пользователя
```yaml
user_name: 'github-actions[bot]'
user_email: 'github-actions[bot]@users.noreply.github.com'
```

#### Пользовательское сообщение коммита
```yaml
commit_message: 'Deploy from ${{ github.sha }}'
full_commit_message: 'Custom deploy message'
```

#### Создание тегов
```yaml
tag_name: 'v1.0.0'
tag_message: 'Release version 1.0.0'
```

## Примеры конфигураций

### Для Vite/React/Vue проектов

```yaml
name: Deploy Vite App

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Для проектов с поддиректорией

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths: ['front/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: front/package-lock.json
      
      - name: Install dependencies
        run: cd front && npm ci
      
      - name: Build
        run: cd front && npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./front/dist
```

### С кэшированием зависимостей

```yaml
name: Deploy with Cache

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
      cancel-in-progress: true
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Полная история для .GitInfo
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          user_name: 'github-actions[bot]'
          user_email: 'github-actions[bot]@users.noreply.github.com'
          commit_message: 'Deploy ${{ github.sha }}'
```

### С пользовательским доменом

```yaml
name: Deploy with Custom Domain

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: mysite.example.com
```

### Деплой в другой репозиторий

```yaml
name: Deploy to External Repository

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        if: github.ref == 'refs/heads/main'
        with:
          personal_token: ${{ secrets.PERSONAL_TOKEN }}
          external_repository: username/docs-site
          publish_dir: ./dist
          publish_branch: main
```

## Настройка аутентификации

### 1. GITHUB_TOKEN (Рекомендуется)

Автоматически доступен в каждом workflow. Не требует дополнительной настройки.

**Ограничения:**
- При первом деплое нужно вручную выбрать ветку gh-pages в настройках репозитория
- Ограниченные права доступа

```yaml
permissions:
  contents: write  # Необходимо для push в gh-pages
```

### 2. Deploy Key (SSH)

**Создание SSH ключа:**

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions" -f gh-pages -N ""
```

**Настройка:**
1. Добавить публичный ключ (`gh-pages.pub`) в Deploy Keys репозитория
2. Добавить приватный ключ (`gh-pages`) в Secrets как `ACTIONS_DEPLOY_KEY`

**Преимущества:**
- Полный доступ к репозиторию
- Автоматическая настройка GitHub Pages
- Более безопасен для критических операций

### 3. Personal Access Token

**Создание:**
1. GitHub Settings → Developer settings → Personal access tokens
2. Создать токен с правами `repo`
3. Добавить в Secrets как `PERSONAL_TOKEN`

**Использование:**
```yaml
with:
  personal_token: ${{ secrets.PERSONAL_TOKEN }}
```

## Устранение проблем

### Проблема: "Resource not accessible by integration"

**Решение:** Добавить permissions в workflow:

```yaml
permissions:
  contents: write
```

### Проблема: Неправильный путь к файлам сборки

**Проверка:** Убедиться, что `publish_dir` указывает на правильную директорию:

```yaml
- name: List build files
  run: ls -la ./dist

- name: Deploy
  uses: peaceiris/actions-gh-pages@v4
  with:
    publish_dir: ./dist  # Убедиться в правильности пути
```

### Проблема: Файлы не обновляются

**Решение:** Использовать `force_orphan` для принудительного обновления:

```yaml
with:
  force_orphan: true
```

### Проблема: Jekyll обрабатывает файлы

**Решение:** Отключить Jekyll (по умолчанию отключен):

```yaml
with:
  enable_jekyll: false  # По умолчанию
```

## Мониторинг и отладка

### Включение подробных логов

```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

### Проверка содержимого директории

```yaml
- name: Debug - List files
  run: |
    echo "Current directory:"
    pwd
    echo "Build directory contents:"
    ls -la ./dist
    echo "Total size:"
    du -sh ./dist
```

### Проверка переменных

```yaml
- name: Debug - Environment
  run: |
    echo "Repository: ${{ github.repository }}"
    echo "Branch: ${{ github.ref }}"
    echo "Event: ${{ github.event_name }}"
```

## Лучшие практики

### 1. Условное выполнение

```yaml
# Деплой только с main ветки
if: github.ref == 'refs/heads/main'

# Деплой только при push (не при PR)
if: github.event_name == 'push'
```

### 2. Управление параллельностью

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### 3. Оптимизация производительности

```yaml
# Кэширование зависимостей
- uses: actions/cache@v4

# Shallow clone для больших репозиториев
- uses: actions/checkout@v4
  with:
    fetch-depth: 1
```

### 4. Безопасность

```yaml
# Минимальные права доступа
permissions:
  contents: write

# Использование конкретных версий
- uses: peaceiris/actions-gh-pages@v4  # Не @main
```

## Интеграция с проектом

### Анализ текущего workflow

Текущий workflow в проекте:

```yaml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: cd front
      - run: npm i
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Проблемы в текущем workflow

1. **Неправильная смена директории:** `cd front` не влияет на последующие команды
2. **Неправильный путь сборки:** `./dist` вместо `./front/dist`
3. **Отсутствие permissions**
4. **Отсутствие условного выполнения**

### Рекомендуемая конфигурация для проекта

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
    paths: ['front/**']  # Запуск только при изменениях в front/

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
      cancel-in-progress: true
    
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
        run: cd front && npm ci
      
      - name: Build
        run: cd front && npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./front/dist
          user_name: 'github-actions[bot]'
          user_email: 'github-actions[bot]@users.noreply.github.com'
```

## Полезные ссылки

- [Официальный репозиторий](https://github.com/peaceiris/actions-gh-pages)
- [GitHub Actions Marketplace](https://github.com/marketplace/actions/github-pages-action)
- [Документация GitHub Pages](https://docs.github.com/en/pages)
- [Примеры использования](https://github.com/peaceiris/actions-gh-pages#examples)
