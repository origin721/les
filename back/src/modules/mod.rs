use actix_web::{
    web::{self},
    App, HttpResponse, HttpServer,
};
use std::{io, sync::Mutex};

use crate::{utils::{get_absolute_path_dir, RelativePathParamsBase}, AppParams};
mod api;
pub mod host_dist;
pub mod my_events;


pub struct AppStateWithCounter {
  counter: Mutex<i32>, // <- Mutex is necessary to mutate safely across threads 
}


pub async fn create_server(params: AppParams) -> Result<(), io::Error> {
    let counter = api::create_count();

    let dist_utils = host_dist::create_dist_utils(RelativePathParamsBase {
        absolute_dir: get_absolute_path_dir(params.relative_path_params.clone()),
        base: params.relative_path_params,
    });

    println!("Started server: {}", params.port);

    // TODO: можно оптимизировать просчитав за 1 цикл
    // когда проходит для создания роутов, получить и роуты и index.html файл
    let fined_index_html = dist_utils
        .iter()
        .find(|dist_item| dist_item.id == "/index.html");
    //
    let index_html = match fined_index_html {
        Some(dist_item) => dist_item.file_content.clone(),
        None => "404 error".to_string(),
    };



    HttpServer::new(move || {
        let index_html = index_html.clone();

        App::new()
            .app_data(counter.clone())
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
