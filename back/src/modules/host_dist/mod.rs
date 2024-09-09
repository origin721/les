use actix_web::{
    post,
    web::{self, Data},
    App, HttpResponse, HttpServer, Responder, Scope,
};
use std::fs;
use std::path::{Path, PathBuf};
use std::{collections::HashMap, sync::Mutex};

use crate::utils::{read_file_contents, read_files_from_dir_relative, RelativePathParams};

// use super::api::AppStateWithCounter;

pub fn add_scope(scope: Scope) -> Scope {
    scope
        .route("/", web::get().to(|| async { "Hello, World!" }))
        .route("/about", web::get().to(|| async { "About Page" }))
}

#[derive(Debug)]
pub struct DistFileItem {
    fileContent: String,
}

type DistFiles = HashMap<String, DistFileItem>;

pub fn create_dist_utils(params: RelativePathParams) -> DistFiles {
    let mut dist_files = HashMap::new();

    let dist_files_list = read_files_from_dir_relative(params);

    // 1. Добавление элементов
    for item in dist_files_list {
        let dist_item = DistFileItem {
            fileContent: match read_file_contents(&item) {
                Ok(content) => content,
                Err(e) => {
                    eprintln!("Ошибка при чтении файла: {}", e);
                    String::new() // Возвращаем пустую строку или можно выбрать другой способ обработки
                }
            },
        };
        dist_files.insert(item.clone(), dist_item);

        println!("{}", item);
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

    for (key, value) in &dist_files {
        println!("Ключ: {}, Значение: {:?}", key, value);
    }

    dist_files
}
