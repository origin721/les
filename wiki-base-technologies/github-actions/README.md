# GitHub Actions - Полное руководство

## Обзор

GitHub Actions - это платформа CI/CD (Continuous Integration/Continuous Deployment), встроенная в GitHub, которая позволяет автоматизировать рабочие процессы разработки программного обеспечения.

## Основные концепции

### Workflow (Рабочий процесс)
- Автоматизированный процесс, состоящий из одного или нескольких jobs
- Определяется в YAML файле в директории `.github/workflows/`
- Запускается по событиям (push, pull request, schedule и др.)

### Job (Задача)
- Набор шагов, выполняющихся на одном runner'е
- Jobs могут выполняться параллельно или последовательно
- Каждый job запускается в свежей виртуальной среде

### Step (Шаг)
- Отдельная задача, которая может выполнить команду или action
- Шаги выполняются последовательно в рамках job'а
- Могут использовать готовые actions или выполнять shell команды

### Action (Действие)
- Переиспользуемый компонент для выполнения сложных задач
- Может быть создан сообществом или самостоятельно
- Доступны в GitHub Marketplace

### Runner (Исполнитель)
- Сервер, который выполняет workflows
- GitHub предоставляет hosted runners (Ubuntu, Windows, macOS)
- Можно использовать self-hosted runners

## Структура Workflow файла

```yaml
name: Название workflow
on: [события для запуска]
jobs:
  job-name:
    runs-on: [тип runner'а]
    steps:
      - name: Название шага
        uses: action@version
        with:
          parameter: value
```

## События запуска (Triggers)

### Push события
```yaml
on:
  push:
    branches: [main, develop]
    paths: ['src/**']
```

### Pull Request события
```yaml
on:
  pull_request:
    branches: [main]
    types: [opened, synchronize]
```

### Расписание
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Каждый день в 2:00 UTC
```

### Ручной запуск
```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
```

## Поддерживаемые платформы

| Runner | GitHub Token | Deploy Key | Personal Token |
|--------|:------------:|:----------:|:--------------:|
| ubuntu-22.04 | ✅ | ✅ | ✅ |
| ubuntu-20.04 | ✅ | ✅ | ✅ |
| ubuntu-latest | ✅ | ✅ | ✅ |
| macos-latest | ✅ | ✅ | ✅ |
| windows-latest | ✅ | ⚠️ | ✅ |

## Типы токенов для аутентификации

### 1. GITHUB_TOKEN (Рекомендуется)
- Автоматически создается для каждого workflow
- Не требует дополнительной настройки
- Ограниченные права доступа
- Работает для публичных и приватных репозиториев

```yaml
- uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
```

### 2. Deploy Key (SSH)
- Требует создания SSH ключей
- Полный доступ к репозиторию
- Более безопасен для критических операций

```yaml
- uses: peaceiris/actions-gh-pages@v4
  with:
    deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}
    publish_dir: ./dist
```

### 3. Personal Access Token
- Требует создания PAT в настройках GitHub
- Широкие права доступа
- Может работать с несколькими репозиториями

```yaml
- uses: peaceiris/actions-gh-pages@v4
  with:
    personal_token: ${{ secrets.PERSONAL_TOKEN }}
    publish_dir: ./dist
```

## Переменные окружения и секреты

### Встроенные переменные
- `${{ github.repository }}` - имя репозитория
- `${{ github.ref }}` - ссылка на ветку/тег
- `${{ github.sha }}` - SHA коммита
- `${{ github.actor }}` - пользователь, запустивший workflow

### Секреты
```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Кэширование

### Кэш зависимостей Node.js
```yaml
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### Кэш зависимостей Python
```yaml
- name: Cache pip
  uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-
```

## Условное выполнение

### Условие по ветке
```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main'
  uses: peaceiris/actions-gh-pages@v4
```

### Условие по событию
```yaml
- name: Deploy
  if: github.event_name == 'push'
  uses: peaceiris/actions-gh-pages@v4
```

### Условие по результату предыдущего шага
```yaml
- name: Test
  id: test
  run: npm test
  
- name: Deploy
  if: steps.test.outcome == 'success'
  uses: peaceiris/actions-gh-pages@v4
```

## Матричные сборки

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest, macos-latest]

runs-on: ${{ matrix.os }}
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

## Безопасность

### Права доступа (Permissions)
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Concurrency (Управление параллельностью)
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

## Отладка и мониторинг

### Включение debug логов
```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

### Вывод переменных
```yaml
- name: Debug info
  run: |
    echo "Repository: ${{ github.repository }}"
    echo "Branch: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
```

## Лучшие практики

### 1. Версионирование actions
```yaml
# ✅ Хорошо - указана конкретная версия
- uses: actions/checkout@v4

# ❌ Плохо - использование latest
- uses: actions/checkout@latest
```

### 2. Использование секретов
```yaml
# ✅ Хорошо - секреты в переменных
env:
  API_KEY: ${{ secrets.API_KEY }}

# ❌ Плохо - секреты в коде
env:
  API_KEY: "sk-1234567890abcdef"
```

### 3. Оптимизация времени выполнения
```yaml
# Использование кэша
- uses: actions/cache@v4

# Параллельное выполнение jobs
jobs:
  test:
    # ...
  build:
    # ...
  deploy:
    needs: [test, build]
```

### 4. Условное выполнение
```yaml
# Деплой только с main ветки
- name: Deploy
  if: github.ref == 'refs/heads/main'
```

## Ограничения

### Время выполнения
- Максимум 6 часов на job
- Максимум 35 дней хранения артефактов
- Лимиты на количество одновременных jobs

### Размеры
- Максимум 25 GB места на runner
- Максимум 10 GB на артефакт
- Максимум 500 MB на лог файл

### API лимиты
- 1000 запросов в час для GITHUB_TOKEN
- Различные лимиты для разных типов аккаунтов

## Полезные ссылки

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
