mod modules;
mod utils;

use utils::{RelativePathParams};

pub struct AppParams {
    port: u16,
    relative_path_params: RelativePathParams,
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let relative_path_params = RelativePathParams {
        current_file: file!().to_string(),
        relative_path: String::from("../dist"),
    };

    // Читаем порт из переменной окружения LES_CONTAINER_PORT, по умолчанию 8080
    let port = std::env::var("LES_CONTAINER_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .unwrap_or(8080);

    let app_params = AppParams {
        port,
        relative_path_params,
    };

    modules::create_server(app_params).await
}
