use actix_web::{post, web::{self, Data}, App, HttpResponse, HttpServer, Responder, Scope};
use std::sync::Mutex;


#[post("/echo")]
pub async fn echo(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

pub struct AppStateWithCounter {
    counter: Mutex<i32>, // <- Mutex is necessary to mutate safely across threads
}

pub fn create_count() -> web::Data<AppStateWithCounter> {
    web::Data::new(AppStateWithCounter {
        counter: Mutex::new(0),
    })
}


async fn index(data: web::Data<AppStateWithCounter>) -> String {
    let mut counter = data.counter.lock().unwrap(); // <- get counter's MutexGuard
    *counter += 1; // <- access counter inside MutexGuard

    format!("Request number: {counter}") // <- response with count
}


async fn manual_hello() -> impl Responder {
    HttpResponse::Ok().body("Hey there!")
}


pub fn scope() -> Scope {
    web::scope("/api")
                    .service(echo)
                    .route("/", web::get().to(index))
                    .route("/hey", web::get().to(manual_hello))
}

