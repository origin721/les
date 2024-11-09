use actix_web::{
    post,
    web::{self, Data},
    App, HttpResponse, HttpServer, Responder, Scope,
};
use std::{fs, sync::Arc};
use std::path::{Path, PathBuf};
use std::{collections::HashMap, sync::Mutex};

use crate::utils::{extract_substring, get_absolute_directory_path, get_directory_path, read_file_contents, read_files_from_dir_relative, RelativePathParams, RelativePathParamsBase};

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

    // let dist_home = get_absolute_directory_path(params);
    // print!("dist_home: {:?}", dist_home);


    // 1. Добавление элементов
    for item in dist_files_list {
        // print!("MY_ITEM: {}", item);

        

        // print!("MY_ITEM_CONTENT: {}", match read_file_contents(&item) {
        //     Ok(content) => {
        //         print!("\nCONTENT: {}", content);
        //         content
        //     },create_dist_utils
        //     Err(e) => {
        //         eprintln!("Ошибка при чтении файла: {}", e);
        //         String::new() // Возвращаем пустую строку или можно выбрать другой способ обработки
        //     }
        // });

        let itemId = extract_substring(&params.absolute_dir, &item);
        println!("route: {}", itemId);
        // TODO: превратить в массив и в ребёнке просто создавать хэш мапу
        let dist_item = DistFileItem {
            id: itemId.clone(),
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
        // print!("PRE_TEST: {}", &item);
        // print!("PRE_TEST1: {}", &params.absolute_dir);
        // println!(k"test: {}", itemId);
    }

    // 2. Удаление элемента по ключу
    // dist_files.remove("key2"); // Удаляем элемент с ключом "key2"

    // 3. Перебор элементов
    // for (key, value) in &dist_files {
    //     println!("Ключ: {}, Значение: {:?}", key, value);
    // }

    // Проверка существования ключа
    // if let Some(value) = dist_files.get("key1") {
    //     println!("Значение для ключа 'key1': {:?}", value);
    // }

    // for (key, value) in &dist_files {
    //     println!("Ключ: \n{}, Значение: \n{:?}", key, value);
    // }

    dist_files
}

async fn get_file_content(dist_item: DistFileItem) -> impl Responder {
    HttpResponse::Ok()
        .content_type(dist_item.content_type.clone())
        .body(dist_item.file_content.clone())
}


pub fn add_routes_to_scope(scope: Scope, dist_utils: DistFiles) -> Scope {
    // let scope = scope
    //     .route("", web::get().to(index))
    //     .route("/", web::get().to(index))
    //     .route("hey", web::get().to(manual_hello));
    let mut new_scope = scope;

    // new_scope = new_scope.route(
    //     "czaa", // Создайте путь на основе ключа
    //     web::get().to( || async {"hi my route"}),
    // );

    for dist_item in dist_utils {
        new_scope = new_scope.route(
            &format!("{}", dist_item.id), // Создайте путь на основе ключа
            // &format!("/{}", key), // Создайте путь на основе ключа
            web::get().to(move || get_file_content(dist_item.clone())),
        );
    }

    //new_scope = new_scope.route()

    new_scope
}