use actix_web::{post, web::{self, Data}, App, HttpResponse, HttpServer, Responder, Scope};
use std::{collections::HashMap, sync::Mutex};
use std::fs;
use std::path::{Path, PathBuf};

use crate::utils::RelativePathParams;

// use super::api::AppStateWithCounter;



pub fn add_scope(scope: Scope) -> Scope {
    scope
        .route("/", web::get().to(|| async { "Hello, World!" }))
        .route("/about", web::get().to(|| async { "About Page" }))
}


struct DistFileItem {

}

type DistFiles = HashMap<String, String>;

pub fn create_dist_utils(params: RelativePathParams) -> DistFiles {
    let mut dist_files = HashMap::new();

    // 1. Добавление элементов
    dist_files.insert("key1".to_string(), "value1".to_string());
    dist_files.insert("key2".to_string(), "value2".to_string());
    dist_files.insert("key3".to_string(), "value3".to_string());

    // 2. Удаление элемента по ключу
    dist_files.remove("key2"); // Удаляем элемент с ключом "key2"

    // 3. Перебор элементов
    for (key, value) in &dist_files {
        println!("Ключ: {}, Значение: {}", key, value);
    }

    // Проверка существования ключа
    if let Some(value) = dist_files.get("key1") {
        println!("Значение для ключа 'key1': {}", value);
    }

    dist_files
}
