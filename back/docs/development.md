# 🛠️ Руководство по разработке

## 🔗 [← Назад к документации](../links.md)

## 🚀 Быстрый старт для разработчиков

### Предварительные требования
- **Rust** 1.70+ (рекомендуется последняя стабильная версия)
- **Cargo** (поставляется с Rust)
- **Git** для клонирования репозитория

### Установка и запуск
```bash
# Переход в директорию проекта
cd back

# Установка зависимостей (автоматически при первом запуске)
cargo build

# Запуск в режиме разработки
cargo run dev

# Или обычный запуск
cargo run
```

## 🔧 Команды разработки

### Основные команды Cargo
```bash
# Сборка проекта
cargo build

# Сборка в release режиме (оптимизированная)
cargo build --release

# Запуск тестов
cargo test

# Проверка кода без сборки
cargo check

# Форматирование кода
cargo fmt

# Линтинг кода
cargo clippy

# Обновление зависимостей
cargo update
```

### Режимы запуска
```bash
# Режим разработки (с дополнительными логами)
cargo run dev

# Обычный режим
cargo run

# Release режим (оптимизированный)
cargo run --release
```

## 📁 Структура для разработки

### Основные файлы для модификации:
```
back/src/
├── main.rs                 # Точка входа - изменения конфигурации
├── modules/
│   ├── mod.rs             # Основная логика сервера
│   ├── api/               # Добавление новых API
│   ├── host_dist/         # Логика раздачи статики
│   └── my_events/         # Обработка событий
└── utils/
    └── mod.rs             # Утилиты - файловые операции
```

### Конфигурационные файлы:
```
back/
├── Cargo.toml             # Зависимости и метаданные
├── Cargo.lock             # Зафиксированные версии
└── .gitignore             # Игнорируемые файлы
```

## 🔄 Workflow разработки

### 1. Добавление новой функциональности

#### Шаг 1: Планирование
- Определите, в какой модуль добавить функциональность
- Проверьте существующие зависимости в `Cargo.toml`
- Создайте план изменений

#### Шаг 2: Реализация
```bash
# Создайте новую ветку (если используете Git)
git checkout -b feature/new-functionality

# Внесите изменения в код
# Проверьте компиляцию
cargo check

# Запустите тесты
cargo test
```

#### Шаг 3: Тестирование
```bash
# Запустите сервер
cargo run dev

# Проверьте функциональность в браузере
# http://127.0.0.1:8080
```

### 2. Добавление новых зависимостей

#### В Cargo.toml:
```toml
[dependencies]
actix-web = "4"
tokio = { version = "1", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }  # Новая зависимость
```

#### Использование в коде:
```rust
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct MyStruct {
    field: String,
}
```

## 🏗️ Архитектурные паттерны

### 1. Добавление нового API эндпоинта

#### Создайте файл `src/modules/api/my_endpoint.rs`:
```rust
use actix_web::{web, HttpResponse, Result};

pub async fn my_handler() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json("Hello from new endpoint"))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.route("/my-endpoint", web::get().to(my_handler));
}
```

#### Подключите в `src/modules/api/mod.rs`:
```rust
mod my_endpoint;

pub fn configure_api(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .configure(my_endpoint::configure)
    );
}
```

#### Зарегистрируйте в `src/modules/mod.rs`:
```rust
use crate::modules::api;

// В функции create_server:
App::new()
    .configure(api::configure_api)  // Добавить эту строку
    // ... остальная конфигурация
```

### 2. Добавление middleware

```rust
use actix_web::middleware::Logger;

// В create_server функции:
App::new()
    .wrap(Logger::default())  // Логирование запросов
    // ... остальная конфигурация
```

### 3. Работа с состоянием приложения

```rust
use std::sync::Mutex;
use actix_web::web;

pub struct MyAppState {
    pub counter: Mutex<i32>,
    pub config: String,
}

// В create_server:
let app_state = web::Data::new(MyAppState {
    counter: Mutex::new(0),
    config: "my_config".to_string(),
});

App::new()
    .app_data(app_state)
    // ...
```

## 🧪 Тестирование

### Юнит тесты
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_my_function() {
        let result = my_function("test");
        assert_eq!(result, "expected");
    }

    #[tokio::test]
    async fn test_async_function() {
        let result = async_function().await;
        assert!(result.is_ok());
    }
}
```

### Интеграционные тесты
```rust
// В tests/integration_test.rs
use actix_web::{test, App};

#[actix_web::test]
async fn test_endpoint() {
    let app = test::init_service(
        App::new().route("/test", web::get().to(|| async { "test" }))
    ).await;

    let req = test::TestRequest::get().uri("/test").to_request();
    let resp = test::call_service(&app, req).await;
    
    assert!(resp.status().is_success());
}
```

## 🔍 Отладка

### Логирование
```rust
// Добавьте в Cargo.toml:
// log = "0.4"
// env_logger = "0.10"

use log::{info, warn, error, debug};

// В main.rs:
env_logger::init();

// В коде:
info!("Server started on port {}", port);
debug!("Processing request: {:?}", request);
warn!("Unusual condition detected");
error!("Error occurred: {}", error);
```

### Отладка с помощью println!
```rust
println!("Debug: variable value = {:?}", variable);
eprintln!("Error: {}", error_message);
```

### Использование отладчика
```bash
# Установка rust-gdb (Linux) или rust-lldb (macOS)
# Сборка с отладочной информацией
cargo build

# Запуск с отладчиком
rust-gdb target/debug/back
# или
rust-lldb target/debug/back
```

## 📊 Производительность

### Профилирование
```bash
# Установка flamegraph
cargo install flamegraph

# Профилирование приложения
cargo flamegraph --bin back

# Бенчмарки
cargo bench
```

### Оптимизация
```toml
# В Cargo.toml для release сборки:
[profile.release]
lto = true              # Link Time Optimization
codegen-units = 1       # Лучшая оптимизация
panic = "abort"         # Меньший размер бинарника
```

## 🔧 Полезные инструменты

### Линтинг и форматирование
```bash
# Установка компонентов
rustup component add rustfmt clippy

# Автоформатирование
cargo fmt

# Проверка стиля кода
cargo clippy

# Проверка с исправлениями
cargo clippy --fix
```

### Документация
```bash
# Генерация документации
cargo doc

# Открытие документации в браузере
cargo doc --open
```

### Безопасность
```bash
# Установка cargo-audit
cargo install cargo-audit

# Проверка уязвимостей
cargo audit
```

## 🚨 Частые проблемы и решения

### 1. Ошибки компиляции
```bash
# Очистка кэша сборки
cargo clean

# Пересборка
cargo build
```

### 2. Проблемы с зависимостями
```bash
# Обновление зависимостей
cargo update

# Проверка дерева зависимостей
cargo tree
```

### 3. Проблемы с портом
```rust
// В main.rs изменить порт:
let appParams = AppParams {
    port: 8081,  // Изменить на свободный порт
    // ...
};
```

### 4. Проблемы с путями к файлам
```rust
// Проверка абсолютного пути
println!("Absolute path: {:?}", std::env::current_dir());
```

## 📚 Дополнительные ресурсы

### Документация
- [Rust Book](https://doc.rust-lang.org/book/) - Основы Rust
- [Actix-web Guide](https://actix.rs/) - Документация фреймворка
- [Tokio Tutorial](https://tokio.rs/tokio/tutorial) - Асинхронное программирование

### Инструменты
- [Rust Analyzer](https://rust-analyzer.github.io/) - LSP для IDE
- [Cargo Watch](https://github.com/watchexec/cargo-watch) - Автоматическая пересборка
- [Cargo Expand](https://github.com/dtolnay/cargo-expand) - Просмотр макросов

---

**📚 Связанные документы:**
- [README.md](../README.md) - Основная документация
- [architecture.md](architecture.md) - Архитектура системы
- [links.md](../links.md) - Навигация
