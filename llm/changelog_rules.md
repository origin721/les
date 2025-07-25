# Правила ведения Changelog для проекта secure-message

## Формат имени файла
```
YYYY_MM_DD_changelog_v0.0.x.md
```

Где:
- `YYYY` - год (4 цифры)
- `MM` - месяц (2 цифры)
- `DD` - день (2 цифры)
- `v0.0.x` - версия проекта

## Примеры имен файлов:
- `2025_06_27_changelog_v0.0.1.md` - первая версия от 27 июня 2025
- `2025_06_28_changelog_v0.0.2.md` - вторая версия от 28 июня 2025
- `2025_07_01_changelog_v0.1.0.md` - минорное обновление от 1 июля 2025

## Структура changelog файла

### Заголовок
```markdown
# Changelog проекта secure-message

## ДД.ММ.ГГГГ - Название релиза/обновления (v0.0.x)
```

### Основные разделы:

#### 1. Выполненные задачи
```markdown
### Выполненные задачи

#### 1. ✅ Название задачи
**Файл(ы):** `путь/к/файлу.ext`

**Изменения:**
- Список изменений
- Что было добавлено
- Что было исправлено

**Функциональность:**
```typescript
// Примеры кода если нужно
```

#### 2. Текущее состояние проекта
```markdown
### Текущее состояние проекта

#### Реализованная функциональность:
1. ✅ **Название функции** - статус
2. ✅ **Другая функция** - статус + дополнения

#### Архитектура:
```
Схема архитектуры или структуры данных
```

#### 3. Следующие задачи
```markdown
### Следующие задачи (не выполнены)

#### Высокий приоритет:
1. **Задача 1** - описание
2. **Задача 2** - описание

#### Средний приоритет:
3. **Задача 3** - описание

#### Низкий приоритет:
4. **Задача 4** - описание
```

#### 4. Технические детали
```markdown
### Технические детали

#### Структуры данных:
```typescript
interface Example {
  field: string;
}
```

#### Используемые технологии:
- **Frontend:** технологии
- **Backend:** технологии
- **Другое:** технологии
```

#### 5. Измененные файлы
```markdown
### Файлы, которые были изменены:
1. `путь/к/файлу1.ext` - описание изменений
2. `путь/к/файлу2.ext` - описание изменений
```

#### 6. Заметки для продолжения
```markdown
### Заметки для продолжения работы:
- Важные заметки
- Рекомендации
- Что нужно протестировать
- Следующие шаги
```

## Правила версионирования

### Семантическое версионирование (SemVer):
- `v0.0.x` - патч-версии (исправления багов, мелкие улучшения)
- `v0.x.0` - минорные версии (новая функциональность)
- `vx.0.0` - мажорные версии (breaking changes)

### Когда увеличивать версию:
- **Патч (0.0.x)**: исправления багов, мелкие улучшения UI, добавление кнопок
- **Минор (0.x.0)**: новые функции, новые компоненты, значительные улучшения
- **Мажор (x.0.0)**: изменения API, изменения структуры данных, breaking changes

## Использование changelog

### При команде "продолжи":
1. Прочитать последний changelog файл
2. Понять текущее состояние проекта
3. Посмотреть список "Следующие задачи"
4. Продолжить с приоритетной задачи

### При создании нового changelog:
1. Скопировать структуру из предыдущего файла
2. Обновить дату и версию
3. Перенести невыполненные задачи из предыдущей версии
4. Добавить новые выполненные задачи
5. Обновить "Текущее состояние проекта"

## Примеры статусов задач:
- ✅ **Выполнено** - задача полностью завершена
- 🔄 **В процессе** - задача начата, но не завершена
- ⏳ **Запланировано** - задача в планах
- ❌ **Отменено** - задача отменена
- 🐛 **Исправлено** - исправлен баг
- ⚡ **Улучшено** - улучшена существующая функциональность

## Важные принципы:
1. **Детальность** - описывать изменения подробно
2. **Техническая точность** - указывать конкретные файлы и функции
3. **Преемственность** - каждый changelog должен быть понятен без предыдущих
4. **Актуальность** - обновлять при каждом значимом изменении
5. **Структурированность** - следовать единому формату
