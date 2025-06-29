#!/run/current-system/sw/bin/bash
##!/bin/bash

# 📝 Скрипт для создания нового changelog файла
# Автор: Система разработки les.scripton.app
# Версия: 1.0

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода цветного текста
print_color() {
    printf "${1}${2}${NC}\n"
}

# Функция для получения текущей даты
get_current_date() {
    date +"%Y_%m_%d"
}

# Функция для получения текущей даты в формате DD.MM.YYYY
get_display_date() {
    date +"%d.%m.%Y"
}

# Функция для получения текущего года
get_current_year() {
    date +"%Y"
}

# Функция для валидации версии
validate_version() {
    if [[ ! $1 =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_color $RED "❌ Ошибка: Неверный формат версии. Используйте формат vX.X.X (например, v0.1.2)"
        exit 1
    fi
}

# Функция для валидации типа релиза
validate_release_type() {
    local valid_types=("Feature" "Bugfix" "Improvement" "Security" "Documentation" "Architecture")
    local type=$1
    
    for valid_type in "${valid_types[@]}"; do
        if [[ "$type" == "$valid_type" ]]; then
            return 0
        fi
    done
    
    print_color $RED "❌ Ошибка: Неверный тип релиза. Доступные типы:"
    printf "   - Feature\n   - Bugfix\n   - Improvement\n   - Security\n   - Documentation\n   - Architecture\n"
    exit 1
}

# Функция для создания шаблона changelog
create_changelog_template() {
    local version=$1
    local date_file=$2
    local date_display=$3
    local release_type=$4
    local description=$5
    local author=$6
    
    cat << EOF
# Changelog $version - $date_display

## 🎯 Краткое описание релиза

$description

## 🔧 [$release_type]

### ✅ [Подкатегория]
- **Проблема:** Описание проблемы или задачи
- **Решение:** Описание того, как была решена проблема
- **Результат:** Что получилось в итоге

### 🚀 [Другая подкатегория]
- Описание изменения
- Техническая информация
- Примеры использования (при необходимости)

## 🔍 Детали изменений (опционально)

### Добавленные файлы:

#### \`path/to/file.js\`
\`\`\`javascript
// Пример кода
export function example() {
  return "Hello World";
}
\`\`\`

## 🎯 Результат

### ✅ Что работает:
- Список работающих функций
- Успешные тесты
- Новые возможности

### ⚠️ Предупреждения (не критичные):
- Список предупреждений
- Deprecated функции
- Планируемые изменения

## 🔧 Техническая информация (опционально)

### Окружение:
- **Технология:** версия
- **Зависимости:** список
- **Конфигурация:** настройки

### Архитектура:
- Описание архитектурных изменений
- Новые паттерны
- Рефакторинг

---

**Версия:** $version  
**Дата:** $date_display  
**Тип:** $release_type  
**Автор:** $author  
**Теги:** #category #component #technology
EOF
}

# Главная функция
main() {
    print_color $BLUE "📝 Создание нового changelog файла"
    print_color $BLUE "=================================="
    
    # Получение версии
    if [[ -z "$1" ]]; then
        print_color $YELLOW "Введите версию (формат vX.X.X, например v0.1.2):"
        read -r version
    else
        version=$1
    fi
    
    validate_version "$version"
    
    # Получение типа релиза
    if [[ -z "$2" ]]; then
        print_color $YELLOW "Выберите тип релиза:"
        print_color $YELLOW "1) Feature - Новые функции"
        print_color $YELLOW "2) Bugfix - Исправления ошибок"
        print_color $YELLOW "3) Improvement - Улучшения"
        print_color $YELLOW "4) Security - Безопасность"
        print_color $YELLOW "5) Documentation - Документация"
        print_color $YELLOW "6) Architecture - Архитектура"
        read -r type_choice
        
        case $type_choice in
            1) release_type="Feature" ;;
            2) release_type="Bugfix" ;;
            3) release_type="Improvement" ;;
            4) release_type="Security" ;;
            5) release_type="Documentation" ;;
            6) release_type="Architecture" ;;
            *) print_color $RED "❌ Неверный выбор"; exit 1 ;;
        esac
    else
        release_type=$2
    fi
    
    validate_release_type "$release_type"
    
    # Получение описания
    if [[ -z "$3" ]]; then
        print_color $YELLOW "Введите краткое описание релиза:"
        read -r description
    else
        description=$3
    fi
    
    # Получение автора
    if [[ -z "$4" ]]; then
        print_color $YELLOW "Введите имя автора (или нажмите Enter для 'Система разработки'):"
        read -r author
        if [[ -z "$author" ]]; then
            author="Система разработки"
        fi
    else
        author=$4
    fi
    
    # Генерация имен файлов и дат
    current_date=$(get_current_date)
    display_date=$(get_display_date)
    current_year=$(get_current_year)
    
    filename="${current_date}_changelog_${version}.md"
    filepath="$current_year/$filename"
    
    # Проверка существования директории
    if [[ ! -d "$current_year" ]]; then
        print_color $YELLOW "📁 Создание директории $current_year/"
        mkdir -p "$current_year"
    fi
    
    # Проверка существования файла
    if [[ -f "$filepath" ]]; then
        print_color $RED "❌ Файл $filepath уже существует!"
        print_color $YELLOW "Хотите перезаписать? (y/N):"
        read -r overwrite
        if [[ "$overwrite" != "y" && "$overwrite" != "Y" ]]; then
            print_color $YELLOW "Операция отменена"
            exit 0
        fi
    fi
    
    # Создание файла
    print_color $BLUE "📝 Создание файла $filepath..."
    create_changelog_template "$version" "$current_date" "$display_date" "$release_type" "$description" "$author" > "$filepath"
    
    # Успешное завершение
    print_color $GREEN "✅ Changelog файл успешно создан!"
    print_color $GREEN "📄 Файл: $filepath"
    print_color $GREEN "📝 Версия: $version"
    print_color $GREEN "🏷️ Тип: $release_type"
    print_color $GREEN "👤 Автор: $author"
    
    print_color $BLUE "\n📋 Следующие шаги:"
    print_color $BLUE "1. Отредактируйте файл $filepath"
    print_color $BLUE "2. Заполните детали изменений"
    print_color $BLUE "3. Добавьте примеры кода при необходимости"
    print_color $BLUE "4. Обновите README.md файлы при необходимости"
    
    # Предложение открыть файл
    print_color $YELLOW "\nХотите открыть файл для редактирования? (y/N):"
    read -r open_file
    if [[ "$open_file" == "y" || "$open_file" == "Y" ]]; then
        if command -v code &> /dev/null; then
            code "$filepath"
        elif command -v nano &> /dev/null; then
            nano "$filepath"
        elif command -v vim &> /dev/null; then
            vim "$filepath"
        else
            print_color $YELLOW "Редактор не найден. Откройте файл вручную: $filepath"
        fi
    fi
}

# Проверка аргументов командной строки
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    print_color $BLUE "📝 Скрипт создания changelog файлов"
    print_color $BLUE "=================================="
    echo ""
    echo "Использование:"
    echo "  $0 [версия] [тип] [описание] [автор]"
    echo ""
    echo "Параметры:"
    echo "  версия     - Версия в формате vX.X.X (например, v0.1.2)"
    echo "  тип        - Тип релиза: Feature, Bugfix, Improvement, Security, Documentation, Architecture"
    echo "  описание   - Краткое описание релиза"
    echo "  автор      - Имя автора (по умолчанию: 'Система разработки')"
    echo ""
    echo "Примеры:"
    echo "  $0 v0.1.2 Feature \"Добавлена новая функция шифрования\""
    echo "  $0 v0.0.9 Bugfix \"Исправлена ошибка импорта\" \"Иван Иванов\""
    echo ""
    echo "Интерактивный режим:"
    echo "  $0"
    exit 0
fi

# Запуск основной функции
main "$@"
