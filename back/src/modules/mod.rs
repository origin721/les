use actix_web::{post, web::{self, Data}, App, HttpResponse, HttpServer, Responder, Scope};
use std::{io, sync::Mutex};
mod api;


pub mod rest {
    pub fn greet() {
        println!("Hello from my_module!");
    }

    pub fn farewell() {
        println!("Goodbye from my_module!");
    }
}


#[actix_web::main]
pub async fn create_server() -> Result<(), io::Error> {
    let counter = api::create_count();
    rest::greet();
    
    HttpServer::new(move|| {
        App::new()
            .app_data(counter.clone())
            .service(api::scope())
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}