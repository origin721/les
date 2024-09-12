use actix_web::{
    post,
    web::{self, Data},
    App, HttpResponse, HttpServer, Responder, Scope,
};
use std::sync::Arc;
use std::{fs, io, sync::Mutex};
use tokio::time::{sleep, Duration};
use actix_web::web::Bytes;

use crate::{utils::{get_absolute_path_dir, RelativePathParams, RelativePathParamsBase}, AppParams};
mod api;
pub mod host_dist;
pub mod my_events;

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
type MyError = io::Error; 
// async fn sse_handler() -> impl Responder {
//     // let stream = stream! {
//     //     let mut count = 0;
//     //     loop {
//     //         count += 1;
//     //         let data = format!("data: Event number {}\n\n", count);
//     //         yield Ok(Bytes::from(data)); // Преобразование строки в Bytes
//     //         sleep(Duration::from_secs(1)).await;
//     //     }
//     // };
//     let stream: impl Stream<Item = Result<Bytes, MyError>> = stream! {
//         let data = "example"; // Replace with your actual data source
//         yield Ok(Bytes::from(data)); // Convert the string to Bytes
//     };

//     HttpResponse::Ok()
//         .content_type("text/event-stream")
//         .streaming(stream) // Преобразование `stream` в поток типа `Result<Bytes, Error>`
// }



#[actix_web::main]
pub async fn create_server(params: AppParams) -> Result<(), io::Error> {
    let counter = api::create_count();
    rest::greet();
    // host_dist::create_dist_utils(params);
    // let params_clone = Arc::new(params);

    let dist_utils = host_dist::create_dist_utils(RelativePathParamsBase {
        absolute_dir: get_absolute_path_dir(params.relative_path_params.clone()),
        base: params.relative_path_params,
    });

    // let mapMutss = Arc::new(Mutex::new(dist_utils));
    
    // let default_content = dist_utils;

    // println!("TMP MESSAGE: {}", default_content);

    println!("Started server: {}", params.port);


    HttpServer::new(move || {
        App::new()
            .app_data(counter.clone())
            .service(host_dist::add_routes_to_scope(
                web::scope(""),
                dist_utils.clone(),
            ))
            // .route("/events", web::get().to(sse_handler))
            // .route("/events", web::get().to(my_events::sse_handler))
            // .default_service(
            //     web::to(move || async move {
            //         HttpResponse::Ok().body(default_content.clone())
            //     }),
            // )
    
    })
    .bind(("127.0.0.1", params.port))?
    .run()
    .await
}
