# 🔌 API Руководство

## 🔗 [← Назад к документации](../links.md)

## 📋 Обзор

Данное руководство описывает, как добавлять новые API эндпоинты в Rust сервер и расширять его функциональность.

## 🏗️ Текущая архитектура API

### Структура модулей API
```
back/src/modules/
├── mod.rs              # Основной модуль сервера
├── api/                # API модули
│   └── mod.rs          # Конфигурация API (создать при необходимости)
├── host_dist/          # Раздача статических файлов
└── my_events/          # Обработка событий
```

### Текущие эндпоинты
- **Статические файлы**: `/*` - раздача файлов из папки `dist`
- **SPA fallback**: Все неизвестные роуты возвращают `index.html`

## 🚀 Добавление нового API эндпоинта

### Шаг 1: Создание API модуля

Создайте файл `src/modules/api/mod.rs`:
```rust
use actix_web::{web, HttpResponse, Result};

// Пример простого эндпоинта
pub async fn health_check() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "message": "Server is running"
    })))
}

// Эндпоинт с параметрами
pub async fn get_info(path: web::Path<String>) -> Result<HttpResponse> {
    let param = path.into_inner();
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "param": param,
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

// Конфигурация API роутов
pub fn configure_api(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/health", web::get().to(health_check))
            .route("/info/{param}", web::get().to(get_info))
    );
}
```

### Шаг 2: Добавление зависимостей

Обновите `Cargo.toml`:
```toml
[dependencies]
actix-web = "4"
tokio = { version = "1", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
chrono = { version = "0.4", features = ["serde"] }
```

### Шаг 3: Интеграция в основной модуль

Обновите `src/modules/mod.rs`:
```rust
use actix_web::{
    web::{self},
    App, HttpResponse, HttpServer,
};
use std::{io, sync::Mutex};

use crate::{utils::{get_absolute_path_dir, RelativePathParamsBase}, AppParams};

mod api;           // Добавить эту строку
pub mod host_dist;
pub mod my_events;

// ... остальной код ...

#[actix_web::main]
pub async fn create_server(params: AppParams) -> Result<(), io::Error> {
    // ... существующий код ...

    HttpServer::new(move || {
        let index_html = index_html.clone();

        App::new()
            .app_data(counter.clone())
            .configure(api::configure_api)  // Добавить эту строку
            .service(host_dist::add_routes_to_scope(
                web::scope(""),
                dist_utils.clone(),
            ))
            .default_service(
                web::to(move || {
                    let index_html = index_html.clone();
                    
                    async move {
                        HttpResponse::Ok().body(index_html.clone())
                    }
                    }
                ),
            )
    })
    .bind(("127.0.0.1", params.port))?
    .run()
    .await
}
```

## 🔧 Примеры API эндпоинтов

### 1. Простой GET эндпоинт
```rust
pub async fn simple_get() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json("Hello, World!"))
}
```

### 2. POST эндпоинт с JSON
```rust
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct CreateRequest {
    name: String,
    description: Option<String>,
}

#[derive(Serialize)]
pub struct CreateResponse {
    id: u32,
    name: String,
    created_at: String,
}

pub async fn create_item(item: web::Json<CreateRequest>) -> Result<HttpResponse> {
    let response = CreateResponse {
        id: 1,
        name: item.name.clone(),
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    
    Ok(HttpResponse::Created().json(response))
}
```

### 3. Эндпоинт с состоянием приложения
```rust
use std::sync::Mutex;

pub struct AppState {
    pub counter: Mutex<i32>,
}

pub async fn increment_counter(data: web::Data<AppState>) -> Result<HttpResponse> {
    let mut counter = data.counter.lock().unwrap();
    *counter += 1;
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "counter": *counter
    })))
}

// В create_server функции:
let app_state = web::Data::new(AppState {
    counter: Mutex::new(0),
});

App::new()
    .app_data(app_state)
    // ...
```

### 4. Эндпоинт с параметрами пути и query
```rust
use actix_web::web::Query;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct QueryParams {
    limit: Option<u32>,
    offset: Option<u32>,
}

pub async fn get_items(
    path: web::Path<u32>,
    query: Query<QueryParams>
) -> Result<HttpResponse> {
    let id = path.into_inner();
    let limit = query.limit.unwrap_or(10);
    let offset = query.offset.unwrap_or(0);
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "id": id,
        "limit": limit,
        "offset": offset,
        "items": []
    })))
}
```

## 🛡️ Middleware и безопасность

### Добавление CORS
```rust
use actix_cors::Cors;

// В create_server функции:
App::new()
    .wrap(
        Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
    )
    // ...
```

### Логирование запросов
```rust
use actix_web::middleware::Logger;

App::new()
    .wrap(Logger::default())
    // ...
```

### Аутентификация (пример)
```rust
use actix_web::{dev::ServiceRequest, Error, HttpMessage};
use actix_web_httpauth::extractors::bearer::BearerAuth;

pub async fn auth_validator(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, Error> {
    // Проверка токена
    if credentials.token() == "valid_token" {
        Ok(req)
    } else {
        Err(actix_web::error::ErrorUnauthorized("Invalid token"))
    }
}
```

## 📊 Обработка ошибок

### Кастомные ошибки
```rust
use actix_web::{HttpResponse, ResponseError};
use std::fmt;

#[derive(Debug)]
pub enum ApiError {
    NotFound,
    BadRequest(String),
    InternalError,
}

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ApiError::NotFound => write!(f, "Resource not found"),
            ApiError::BadRequest(msg) => write!(f, "Bad request: {}", msg),
            ApiError::InternalError => write!(f, "Internal server error"),
        }
    }
}

impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        match self {
            ApiError::NotFound => HttpResponse::NotFound().json("Not found"),
            ApiError::BadRequest(msg) => HttpResponse::BadRequest().json(msg),
            ApiError::InternalError => HttpResponse::InternalServerError().json("Internal error"),
        }
    }
}
```

## 🧪 Тестирование API

### Юнит тесты
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, App};

    #[actix_web::test]
    async fn test_health_check() {
        let app = test::init_service(
            App::new().configure(configure_api)
        ).await;

        let req = test::TestRequest::get()
            .uri("/api/health")
            .to_request();
        
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }

    #[actix_web::test]
    async fn test_create_item() {
        let app = test::init_service(
            App::new().configure(configure_api)
        ).await;

        let payload = serde_json::json!({
            "name": "Test Item",
            "description": "Test Description"
        });

        let req = test::TestRequest::post()
            .uri("/api/items")
            .set_json(&payload)
            .to_request();
        
        let resp = test::call_service(&app, req).await;
        assert_eq!(resp.status(), 201);
    }
}
```

## 📝 Документация API

### Swagger/OpenAPI (опционально)
```toml
# В Cargo.toml
[dependencies]
utoipa = "4.0"
utoipa-swagger-ui = "4.0"
```

```rust
use utoipa::{OpenApi, ToSchema};

#[derive(ToSchema, Serialize, Deserialize)]
pub struct Item {
    id: u32,
    name: String,
}

#[utoipa::path(
    get,
    path = "/api/items/{id}",
    responses(
        (status = 200, description = "Item found", body = Item),
        (status = 404, description = "Item not found")
    )
)]
pub async fn get_item(path: web::Path<u32>) -> Result<HttpResponse> {
    // реализация
}
```

## 🚀 Примеры использования

### Тестирование с curl
```bash
# Health check
curl http://127.0.0.1:8080/api/health

# GET с параметрами
curl http://127.0.0.1:8080/api/info/test

# POST с JSON
curl -X POST http://127.0.0.1:8080/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "Test"}'

# GET с query параметрами
curl "http://127.0.0.1:8080/api/items/1?limit=5&offset=10"
```

## 🔧 Расширенные возможности

### WebSocket поддержка
```rust
use actix_web_actors::ws;

pub async fn websocket_handler(
    req: HttpRequest,
    stream: web::Payload,
) -> Result<HttpResponse, Error> {
    ws::start(MyWebSocket::new(), &req, stream)
}
```

### Файловые загрузки
```rust
use actix_multipart::Multipart;
use futures_util::TryStreamExt;

pub async fn upload_file(mut payload: Multipart) -> Result<HttpResponse> {
    while let Some(mut field) = payload.try_next().await? {
        let content_disposition = field.content_disposition();
        
        if let Some(filename) = content_disposition.get_filename() {
            // Обработка файла
        }
    }
    
    Ok(HttpResponse::Ok().json("File uploaded"))
}
```

---

**📚 Связанные документы:**
- [README.md](../README.md) - Основная документация
- [development.md](development.md) - Руководство по разработке
- [architecture.md](architecture.md) - Архитектура системы
- [links.md](../links.md) - Навигация
