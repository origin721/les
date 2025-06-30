# ⚡ Быстрый справочник

## 🔗 [← Назад к документации](../links.md)

## 🚀 Команды запуска

```bash
# Переход в директорию
cd back

# Запуск в режиме разработки
cargo run dev

# Обычный запуск
cargo run

# Release сборка и запуск
cargo run --release
```

## 🔧 Команды разработки

### Сборка и проверка
```bash
cargo build          # Сборка проекта
cargo build --release # Оптимизированная сборка
cargo check          # Быстрая проверка без сборки
cargo clean          # Очистка кэша сборки
```

### Тестирование
```bash
cargo test           # Запуск всех тестов
cargo test --release # Тесты в release режиме
cargo test test_name # Запуск конкретного теста
```

### Качество кода
```bash
cargo fmt            # Форматирование кода
cargo clippy         # Линтинг и советы
cargo clippy --fix   # Автоисправления
```

### Зависимости
```bash
cargo update         # Обновление зависимостей
cargo tree           # Дерево зависимостей
cargo audit          # Проверка уязвимостей (требует установки)
```

## 📁 Структура файлов

```
back/
├── src/
│   ├── main.rs              # 🎯 Точка входа
│   ├── modules/
│   │   ├── mod.rs           # 🌐 HTTP сервер
│   │   ├── api/             # 🔌 API эндпоинты
│   │   ├── host_dist/       # 📁 Статические файлы
│   │   └── my_events/       # 📡 События
│   └── utils/
│       └── mod.rs           # 🛠️ Файловые утилиты
├── docs/                    # 📚 Документация
├── Cargo.toml              # ⚙️ Конфигурация
└── README.md               # 📖 Основная документация
```

## 🌐 Сетевые настройки

- **Порт**: 8080
- **Адрес**: 127.0.0.1 (localhost)
- **URL**: http://127.0.0.1:8080
- **Статические файлы**: Из папки `../dist`

## 🔧 Основные компоненты

### main.rs
```rust
// Конфигурация сервера
AppParams {
    port: 8080,
    relative_path_params: RelativePathParams {
        current_file: file!(),
        relative_path: "../dist",
    }
}
```

### modules/mod.rs
```rust
// HTTP сервер на Actix-web
HttpServer::new(|| {
    App::new()
        .service(static_files)
        .default_service(spa_fallback)
})
.bind(("127.0.0.1", 8080))
```

## 📊 Зависимости

### Основные
```toml
actix-web = "4"              # Web framework
tokio = { version = "1", features = ["full"] }  # Async runtime
```

### Дополнительные (для API)
```toml
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
chrono = { version = "0.4", features = ["serde"] }
```

## 🔍 Отладка

### Логирование
```rust
println!("Debug: {}", value);
eprintln!("Error: {}", error);
```

### Переменные окружения
```bash
RUST_LOG=debug cargo run    # Подробные логи
RUST_BACKTRACE=1 cargo run  # Трассировка ошибок
```

## 🧪 Тестирование

### Юнит тесты
```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_function() {
        assert_eq!(result, expected);
    }
}
```

### HTTP тесты
```bash
# Health check (если API добавлено)
curl http://127.0.0.1:8080/api/health

# Статические файлы
curl http://127.0.0.1:8080/

# SPA роутинг
curl http://127.0.0.1:8080/any-route
```

## 🚨 Частые проблемы

### Порт занят
```bash
# Найти процесс на порту 8080
lsof -i :8080
# или
netstat -tulpn | grep 8080

# Убить процесс
kill -9 <PID>
```

### Ошибки компиляции
```bash
cargo clean && cargo build
```

### Проблемы с зависимостями
```bash
cargo update
rm Cargo.lock && cargo build
```

## 📚 Быстрые ссылки

### Документация
- **[README.md](../README.md)** - Основная документация
- **[architecture.md](architecture.md)** - Архитектура
- **[development.md](development.md)** - Разработка
- **[api-guide.md](api-guide.md)** - API руководство

### Исходный код
- **[src/main.rs](../src/main.rs)** - Точка входа
- **[src/modules/mod.rs](../src/modules/mod.rs)** - Основной модуль
- **[src/utils/mod.rs](../src/utils/mod.rs)** - Утилиты

### Конфигурация
- **[Cargo.toml](../Cargo.toml)** - Зависимости
- **[links.md](../links.md)** - Навигация

## 🎯 Workflow разработки

1. **Клонирование/Переход**
   ```bash
   cd back
   ```

2. **Разработка**
   ```bash
   cargo check    # Проверка
   cargo run dev  # Тестирование
   ```

3. **Тестирование**
   ```bash
   cargo test
   cargo clippy
   ```

4. **Деплой**
   ```bash
   cargo build --release
   cargo run --release
   ```

## 🔧 Полезные алиасы

Добавьте в `~/.bashrc` или `~/.zshrc`:
```bash
alias cr='cargo run'
alias crd='cargo run dev'
alias cb='cargo build'
alias ct='cargo test'
alias cc='cargo check'
alias cf='cargo fmt'
alias cl='cargo clippy'
```

---

**⚡ Этот справочник содержит самые часто используемые команды и информацию для быстрого доступа.**
