# Интеграция GitHub Actions в проект - Резюме и рекомендации

## Текущее состояние

### Существующий workflow (`.github/workflows/gh-pages-deploy.yml`)

```yaml
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
      - run: cd front
      - run: npm i
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Выявленные проблемы

1. **❌ Неправильная смена директории**
   - `cd front` не влияет на последующие команды
   - Каждый `run` выполняется в отдельном shell

2. **❌ Неправильный путь к файлам сборки**
   - Указан `./dist`, но Vite создает файлы в `./front/dist`

3. **❌ Отсутствие permissions**
   - Может вызвать ошибку "Resource not accessible by integration"

4. **❌ Отсутствие условного выполнения**
   - Деплой может выполняться даже при неудачной сборке

5. **❌ Использование `npm i` вместо `npm ci`**
   - Менее надежно для CI/CD

## Рекомендуемые исправления

### Исправленный workflow

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
      contents: write  # Необходимо для push в gh-pages
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

### Ключевые изменения

1. **✅ Правильная работа с директориями**
   ```yaml
   - name: Install dependencies
     run: cd front && npm ci
   
   - name: Build
     run: cd front && npm run build
   ```

2. **✅ Правильный путь к файлам сборки**
   ```yaml
   publish_dir: ./front/dist
   ```

3. **✅ Добавлены permissions**
   ```yaml
   permissions:
     contents: write
   ```

4. **✅ Условное выполнение**
   ```yaml
   if: github.ref == 'refs/heads/main'
   ```

5. **✅ Оптимизации**
   - Кэширование npm зависимостей
   - Запуск только при изменениях в `front/`
   - Управление параллельностью (concurrency)
   - Использование `npm ci` вместо `npm i`

## Дополнительные улучшения

### Добавление тестирования

```yaml
- name: Run tests
  run: cd front && npm test
```

### Добавление линтинга

```yaml
- name: Lint code
  run: cd front && npm run lint
```

### Добавление проверки типов (если используется TypeScript)

```yaml
- name: Type check
  run: cd front && npm run type-check
```

### Полный workflow с тестированием

```yaml
name: Build, Test and Deploy

on:
  push:
    branches: [main]
    paths: ['front/**']
  pull_request:
    branches: [main]
    paths: ['front/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: front/package-lock.json
      
      - name: Install dependencies
        run: cd front && npm ci
      
      - name: Lint
        run: cd front && npm run lint
      
      - name: Type check
        run: cd front && npm run type-check
      
      - name: Test
        run: cd front && npm test

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
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
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

## Настройка GitHub Pages

### После первого деплоя

1. Перейти в Settings → Pages
2. Выбрать Source: "Deploy from a branch"
3. Выбрать Branch: "gh-pages"
4. Сохранить настройки

### Проверка деплоя

1. Проверить Actions tab для статуса выполнения
2. Проверить ветку `gh-pages` для файлов
3. Открыть URL GitHub Pages для проверки сайта

## Мониторинг и отладка

### Включение debug логов

```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

### Проверка файлов сборки

```yaml
- name: Debug - List build files
  run: |
    echo "Build directory contents:"
    ls -la ./front/dist
    echo "Total size:"
    du -sh ./front/dist
```

## Следующие шаги

1. **Немедленно:** Исправить текущий workflow с минимальными изменениями
2. **Краткосрочно:** Добавить тестирование и линтинг
3. **Долгосрочно:** Рассмотреть использование Deploy Keys для повышенной безопасности

## Полезные команды для отладки

```bash
# Локальная проверка сборки
cd front
npm ci
npm run build
ls -la dist/

# Проверка размера сборки
du -sh dist/

# Проверка содержимого index.html
cat dist/index.html
```

## Документация

- [GitHub Actions - Полное руководство](./README.md)
- [peaceiris/actions-gh-pages - Подробное руководство](./peaceiris-gh-pages.md)
- [Официальная документация GitHub Pages](https://docs.github.com/en/pages)
