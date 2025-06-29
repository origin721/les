# GitHub Actions - Практическое руководство

## 🎯 Цель

Пошаговое руководство по настройке и исправлению GitHub Actions для автоматического деплоя на GitHub Pages в проекте secure-message.

## 🚨 Критические проблемы в текущем workflow

### Анализ текущего файла `.github/workflows/gh-pages-deploy.yml`

```yaml
# ❌ ПРОБЛЕМНЫЙ WORKFLOW
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

### Выявленные проблемы

1. **❌ Неправильная смена директории**
   - `cd front` не влияет на последующие команды
   - Каждый `run` выполняется в отдельном shell

2. **❌ Неправильный путь к файлам сборки**
   - Указан `./dist`, но Vite создает файлы в `./front/dist`

3. **❌ Отсутствие permissions**
   - Может вызвать ошибку "Resource not accessible by integration"

4. **❌ Использование `npm i` вместо `npm ci`**
   - Менее надежно для CI/CD окружения

## ✅ Исправленный workflow

### Минимальное исправление

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # Необходимо для push в gh-pages
    
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
```

### Расширенная версия с тестированием

```yaml
name: Build, Test and Deploy

on:
  push:
    branches: [main]
    paths: ['front/**']  # Запуск только при изменениях в front/
  pull_request:
    branches: [main]
    paths: ['front/**']

jobs:
  test:
    runs-on: ubuntu-latest
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
      
      - name: Lint
        run: cd front && npm run lint
        continue-on-error: true  # Не останавливать при ошибках линтера
      
      - name: Type check
        run: cd front && npm run type-check
        continue-on-error: true
      
      - name: Test
        run: cd front && npm test
        continue-on-error: true

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
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
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./front/dist
          user_name: 'github-actions[bot]'
          user_email: 'github-actions[bot]@users.noreply.github.com'
```

## 🔧 Пошаговая инструкция по исправлению

### Шаг 1: Резервное копирование

```bash
# Создать резервную копию текущего workflow
cp .github/workflows/gh-pages-deploy.yml .github/workflows/gh-pages-deploy.yml.backup
```

### Шаг 2: Исправление workflow файла

1. Открыть файл `.github/workflows/gh-pages-deploy.yml`
2. Заменить содержимое на исправленную версию (см. выше)
3. Сохранить файл

### Шаг 3: Проверка локальной сборки

```bash
# Перейти в директорию фронтенда
cd front

# Установить зависимости
npm ci

# Проверить сборку
npm run build

# Проверить результат
ls -la dist/
```

### Шаг 4: Коммит и push

```bash
# Добавить изменения
git add .github/workflows/gh-pages-deploy.yml

# Создать коммит
git commit -m "fix: исправление GitHub Actions workflow для деплоя на GitHub Pages

- Исправлена смена директории (cd front && команда)
- Исправлен путь к файлам сборки (./front/dist)
- Добавлены permissions для GitHub Actions
- Заменен npm i на npm ci для стабильности
- Добавлено кеширование npm зависимостей"

# Отправить в репозиторий
git push origin main
```

## 🔍 Настройка GitHub Pages

### Автоматическая настройка (рекомендуется)

После первого успешного деплоя GitHub Pages настроится автоматически.

### Ручная настройка

1. Перейти в **Settings** репозитория
2. Найти раздел **Pages** в левом меню
3. В разделе **Source** выбрать **Deploy from a branch**
4. Выбрать ветку **gh-pages** и папку **/ (root)**
5. Нажать **Save**

### Настройка permissions для GitHub Actions

1. Перейти в **Settings** → **Actions** → **General**
2. В разделе **Workflow permissions** выбрать **Read and write permissions**
3. Убедиться, что **Allow GitHub Actions to create and approve pull requests** включено

## 📊 Мониторинг деплоя

### Проверка статуса workflow

1. Перейти на вкладку **Actions** в репозитории
2. Найти последний запуск workflow "Deploy to GitHub Pages"
3. Проверить статус каждого шага

### Проверка GitHub Pages

1. Перейти в **Settings** → **Pages**
2. Проверить статус деплоя
3. Открыть URL сайта для проверки

### Проверка файлов в ветке gh-pages

```bash
# Переключиться на ветку gh-pages
git checkout gh-pages

# Проверить содержимое
ls -la

# Вернуться на main
git checkout main
```

## 🐛 Устранение проблем

### Проблема: "Resource not accessible by integration"

**Причина**: Отсутствуют permissions для GitHub Actions

**Решение**:
```yaml
permissions:
  contents: write
```

### Проблема: "No such file or directory: ./dist"

**Причина**: Неправильный путь к файлам сборки

**Решение**:
```yaml
publish_dir: ./front/dist  # Вместо ./dist
```

### Проблема: Команды npm выполняются в неправильной директории

**Причина**: Неправильная смена директории

**Решение**:
```yaml
- name: Install dependencies
  run: cd front && npm ci  # Вместо отдельных команд cd и npm
```

### Проблема: Workflow не запускается

**Возможные причины и решения**:

1. **Неправильный синтаксис YAML**
   ```bash
   # Проверить синтаксис онлайн
   # https://yaml-online-parser.appspot.com/
   ```

2. **Неправильное имя ветки**
   ```yaml
   on:
     push:
       branches: [main]  # Убедиться, что используется правильное имя ветки
   ```

3. **Отключены GitHub Actions**
   - Проверить Settings → Actions → General

### Проблема: Сборка завершается с ошибкой

**Отладка**:

1. **Включить debug логи**:
   ```yaml
   env:
     ACTIONS_STEP_DEBUG: true
   ```

2. **Добавить отладочную информацию**:
   ```yaml
   - name: Debug - Environment
     run: |
       echo "Node version: $(node --version)"
       echo "NPM version: $(npm --version)"
       echo "Current directory: $(pwd)"
       echo "Directory contents:"
       ls -la
   
   - name: Debug - Front directory
     run: |
       echo "Front directory contents:"
       ls -la front/
       echo "Package.json exists:"
       test -f front/package.json && echo "Yes" || echo "No"
   ```

3. **Проверить логи сборки**:
   ```yaml
   - name: Build with verbose output
     run: cd front && npm run build --verbose
   ```

## 🚀 Дополнительные улучшения

### Кеширование зависимостей

```yaml
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: front/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('front/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### Условное выполнение

```yaml
# Деплой только с main ветки
- name: Deploy
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  uses: peaceiris/actions-gh-pages@v4
```

### Уведомления о статусе

```yaml
- name: Notify on success
  if: success()
  run: echo "✅ Деплой успешно завершен!"

- name: Notify on failure
  if: failure()
  run: echo "❌ Деплой завершился с ошибкой!"
```

## 📋 Чек-лист проверки

### Перед деплоем

- [ ] Локальная сборка работает (`cd front && npm run build`)
- [ ] Файлы создаются в `front/dist/`
- [ ] Workflow файл имеет правильный синтаксис
- [ ] Permissions настроены в workflow
- [ ] GitHub Actions включены в репозитории

### После деплоя

- [ ] Workflow выполнился успешно
- [ ] Ветка `gh-pages` создана и содержит файлы
- [ ] GitHub Pages настроен и активен
- [ ] Сайт доступен по URL GitHub Pages
- [ ] Все ресурсы загружаются корректно

## 🔗 Полезные команды

### Локальная отладка

```bash
# Проверка сборки
cd front
npm ci
npm run build
ls -la dist/

# Проверка размера сборки
du -sh dist/

# Локальный сервер для тестирования
npm run preview
```

### Git команды

```bash
# Проверка статуса workflow
git log --oneline -10

# Проверка ветки gh-pages
git ls-remote origin gh-pages

# Принудительная синхронизация
git fetch origin
git reset --hard origin/main
```

### GitHub CLI (если установлен)

```bash
# Проверка статуса Actions
gh run list

# Просмотр логов последнего запуска
gh run view --log

# Повторный запуск workflow
gh workflow run "Deploy to GitHub Pages"
```

---

**Следующий шаг**: После исправления workflow создать [быстрый справочник](./QUICK_REFERENCE.md) для повседневного использования.
