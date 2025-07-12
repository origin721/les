use actix_web::{
    web::{self}, HttpResponse, Responder, Scope,
};
use std::path::Path;

use crate::utils::{
    extract_substring,
    read_file_contents,
    read_files_from_dir_relative,
    RelativePathParamsBase
};

// use super::api::AppStateWithCounter;

pub fn add_scope(scope: Scope) -> Scope {
    scope
        .route("/", web::get().to(|| async { "Hello, World!" }))
        .route("/about", web::get().to(|| async { "About Page" }))
}

#[derive(Debug)]
#[derive(Clone)]
pub struct DistFileItem {
    pub file_content: String,
    pub id: String,
    pub content_type: String,
}

type DistFiles = Vec<DistFileItem>;

fn get_content_type(file_path: &str) -> &'static str {
    let path = Path::new(file_path);

    // Получаем расширение файла
    if let Some(extension) = path.extension() {
        // Сравниваем расширение файла
        match extension.to_str() {
            Some("html") => "text/html",
            Some("css") => "text/css",
            Some("js") => "application/javascript",
            Some("json") => "application/json",
            Some("png") => "image/png",
            Some("jpg") | Some("jpeg") => "image/jpeg",
            Some("gif") => "image/gif",
            Some("svg") => "image/svg+xml",
            Some("pdf") => "application/pdf",
            Some("txt") => "text/plain",
            _ => "application/octet-stream", // Для неизвестных расширений
        }
    } else {
        "application/octet-stream" // Без расширения
    }
}

pub fn create_dist_utils(params: RelativePathParamsBase) -> DistFiles {
    let mut dist_files = Vec::new();

    let dist_files_list = read_files_from_dir_relative(params.base.clone());

    // Добавление элементов
    for item in dist_files_list {

        let itemId = extract_substring(&params.absolute_dir, &item);
        let endpointId = if itemId == "/index.html" {
            itemId.clone()
        } else {
            format!("/les{}", itemId)
        };

        println!("route: {}", endpointId);

        let dist_item = DistFileItem {
            id: endpointId.clone(),
            content_type: get_content_type(&itemId).to_string(),
            file_content: match read_file_contents(&item) {
                Ok(content) => content,
                Err(e) => {
                    eprintln!("Ошибка при чтении файла: {}", e);
                    String::new() // Возвращаем пустую строку или можно выбрать другой способ обработки
                }
            },
        };


        dist_files.push(dist_item);
    }

    dist_files
}

async fn get_file_content(dist_item: DistFileItem) -> impl Responder {
    HttpResponse::Ok()
        .content_type(dist_item.content_type.clone())
        .body(dist_item.file_content.clone())
}


pub fn add_routes_to_scope(scope: Scope, dist_utils: DistFiles) -> Scope {
    let mut new_scope = scope;

    for dist_item in dist_utils {
        new_scope = new_scope.route(
            &format!("{}", dist_item.id), // Создайте путь на основе ключа
            web::get().to(move || get_file_content(dist_item.clone())),
        );
    }

    new_scope
}
