use actix_web::{
    post,
    web::{self, Data},
    App, HttpResponse, HttpServer, Responder, Scope,
};
use std::sync::Arc;
use std::{fs, io, sync::Mutex};

use crate::utils::{RelativePathParams, RelativePathParamsBase};
mod api;
pub mod host_dist;

pub mod rest {
    pub fn greet() {
        println!("Hello from my_module!");
    }

    pub fn farewell() {
        println!("Goodbye from my_module!");
    }
}

// Асинхронный обработчик для 404 страницы
async fn not_found() -> HttpResponse {
    HttpResponse::NotFound().body("Page not found")
}

pub struct AppStateWithCounter {
    counter: Mutex<i32>, // <- Mutex is necessary to mutate safely across threads
}

// Пример обработчиков для маршрутов
async fn index() -> impl Responder {
    HttpResponse::Ok().body("Index Page")
}

async fn manual_hello() -> impl Responder {
    HttpResponse::Ok().body("Hello from /hey")
}

// Функция, которая добавляет маршруты к существующему Scope
fn add_routes_to_scope(scope: Scope) -> Scope {
    // let scope = scope
    //     .route("", web::get().to(index))
    //     .route("/", web::get().to(index))
    //     .route("hey", web::get().to(manual_hello));
    let scope = scope.route("ok", web::get().to(index));
    host_dist::add_scope(scope)
}



#[actix_web::main]
pub async fn create_server(params: RelativePathParamsBase) -> Result<(), io::Error> {
    let counter = api::create_count();
    rest::greet();
    // host_dist::create_dist_utils(params);
    // let params_clone = Arc::new(params);

    HttpServer::new(move || {
        App::new()
            .app_data(counter.clone())
            .service(host_dist::add_routes_to_scope(
                web::scope(""),
                params.clone(),
            ))
            .default_service(web::to(not_found))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
