# GitHub Actions - Быстрый справочник

## 🚀 Быстрый старт

### Проверка текущего статуса

```bash
# Проверить последние коммиты
git log --oneline -5

# Проверить статус GitHub Actions (если установлен GitHub CLI)
gh run list --limit 5

# Проверить ветку gh-pages
git ls-remote origin gh-pages
```

### Локальная проверка перед push

```bash
cd front
npm ci
npm run build
ls -la dist/
```

## 🔧 Исправление workflow

### Минимальный рабочий workflow

```yaml
name: Deploy to GitHub Pages
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
          cache-dependency-path: front/package-lock.json
      - run: cd front && npm ci
      - run: cd front && npm run build
      - uses: peaceiris/actions-gh-pages@v4
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./front/dist
```

## 🐛 Частые ошибки и решения

| Ошибка | Причина | Решение |
|--------|---------|---------|
| `Resource not accessible by integration` | Нет permissions | Добавить `permissions: contents: write` |
| `No such file or directory: ./dist` | Неправильный путь | Использовать `./front/dist` |
| `npm: command not found` | Неправильная директория | Использовать `cd front && npm ci` |
| `Package-lock.json not found` | Неправильный путь кеша | `cache-dependency-path: front/package-lock.json` |
| Workflow не запускается | Синтаксис YAML | Проверить отступы и структуру |

## 📋 Чек-лист настройки

### Обязательные шаги

- [ ] **Permissions в workflow**: `permissions: contents: write`
- [ ] **Правильный путь сборки**: `publish_dir: ./front/dist`
- [ ] **Команды в правильной директории**: `cd front && npm ci`
- [ ] **Кеширование npm**: `cache-dependency-path: front/package-lock.json`
- [ ] **Условное выполнение**: `if: github.ref == 'refs/heads/main'`

### Настройки GitHub

- [ ] **Actions включены**: Settings → Actions → General
- [ ] **Workflow permissions**: Read and write permissions
- [ ] **GitHub Pages**: Settings → Pages → Deploy from branch → gh-pages

## 🔍 Отладка

### Включение debug режима

```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

### Отладочные команды

```yaml
- name: Debug Info
  run: |
    echo "Node: $(node --version)"
    echo "NPM: $(npm --version)"
    echo "PWD: $(pwd)"
    echo "Contents:"
    ls -la
    echo "Front dir:"
    ls -la front/
```

### Проверка сборки

```yaml
- name: Check Build
  run: |
    cd front
    npm run build
    echo "Build contents:"
    ls -la dist/
    echo "Index.html exists:"
    test -f dist/index.html && echo "✅ Yes" || echo "❌ No"
```

## 📊 Мониторинг

### Проверка статуса

```bash
# Через веб-интерфейс
# 1. GitHub → Actions tab
# 2. Settings → Pages

# Через CLI (если установлен gh)
gh run list
gh run view --log
```

### Проверка результата

```bash
# Проверить ветку gh-pages
git fetch origin
git checkout gh-pages
ls -la
git checkout main

# Проверить URL сайта
# https://username.github.io/secure-message/
```

## ⚡ Быстрые команды

### Принудительный перезапуск

```bash
# Пустой коммит для перезапуска workflow
git commit --allow-empty -m "trigger: перезапуск GitHub Actions"
git push origin main
```

### Очистка кеша

```yaml
# В workflow добавить для очистки кеша
- name: Clear cache
  run: |
    rm -rf front/node_modules
    rm -f front/package-lock.json
    cd front && npm install
```

### Локальная имитация GitHub Pages

```bash
cd front
npm run build
npx serve dist -p 3000
# Открыть http://localhost:3000
```

## 🔧 Полезные сниппеты

### Условное выполнение

```yaml
# Только для main ветки
if: github.ref == 'refs/heads/main'

# Только для push (не PR)
if: github.event_name == 'push'

# Комбинированное условие
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

### Кеширование

```yaml
# NPM кеш
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('front/package-lock.json') }}

# Node modules кеш
- uses: actions/cache@v4
  with:
    path: front/node_modules
    key: ${{ runner.os }}-nodemodules-${{ hashFiles('front/package-lock.json') }}
```

### Уведомления

```yaml
# Успех
- name: Success
  if: success()
  run: echo "✅ Деплой завершен успешно!"

# Ошибка
- name: Failure
  if: failure()
  run: echo "❌ Ошибка деплоя!"
```

## 📱 GitHub Pages настройки

### Автоматическая настройка

После первого успешного деплоя GitHub Pages настроится автоматически.

### Ручная настройка

1. **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: gh-pages
4. **Folder**: / (root)
5. **Save**

### Кастомный домен

```yaml
# В workflow добавить
- uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./front/dist
    cname: your-domain.com
```

## 🚨 Экстренное восстановление

### Если workflow сломался

1. **Откатить изменения**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Восстановить из backup**:
   ```bash
   cp .github/workflows/gh-pages-deploy.yml.backup .github/workflows/gh-pages-deploy.yml
   git add .github/workflows/gh-pages-deploy.yml
   git commit -m "restore: восстановление рабочего workflow"
   git push origin main
   ```

### Если GitHub Pages не работает

1. **Проверить настройки**: Settings → Pages
2. **Проверить ветку gh-pages**: должна существовать и содержать файлы
3. **Принудительный деплой**:
   ```bash
   git commit --allow-empty -m "force: принудительный деплой"
   git push origin main
   ```

## 📞 Получение помощи

### Логи и отладка

```bash
# Просмотр логов workflow
gh run view --log

# Проверка синтаксиса YAML
# https://yaml-online-parser.appspot.com/

# Проверка статуса GitHub
# https://www.githubstatus.com/
```

### Документация

- [Основное руководство](./README.md)
- [Практическое руководство](./PRACTICAL_GUIDE.md)
- [Анализ проекта](./project-integration-summary.md)
- [Центральный индекс](./INDEX.md)

## 🎯 Следующие шаги

### После исправления workflow

1. ✅ Проверить успешный деплой
2. ✅ Убедиться, что сайт работает
3. ✅ Настроить мониторинг
4. ⏳ Добавить тестирование
5. ⏳ Оптимизировать время сборки

### Дополнительные улучшения

- Добавить линтинг и тестирование
- Настроить уведомления о статусе
- Добавить деплой preview для PR
- Настроить кастомный домен
- Добавить мониторинг производительности

---

**💡 Совет**: Сохраните этот файл в закладки для быстрого доступа к командам и решениям!
