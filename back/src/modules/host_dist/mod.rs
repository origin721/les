use actix_web::{post, web::{self, Data}, App, HttpResponse, HttpServer, Responder, Scope};
use std::sync::Mutex;
use std::fs;
use std::path::{Path, PathBuf};

// use super::api::AppStateWithCounter;

/// Рекурсивно получает все файлы в директории и вложенных директориях
fn get_all_files(dir: &Path) -> Vec<String> {
    let mut file_paths = Vec::new();
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                file_paths.extend(get_all_files(&path));
            } else if path.is_file() {
                // Получаем путь к файлу относительно исходной директории
                if let Some(relative_path) = path.strip_prefix(dir).ok() {
                    file_paths.push(relative_path.display().to_string());
                }
            }
        }
    }
    file_paths
}



async fn index(data: web::Data<super::AppStateWithCounter>) -> String {
    let mut counter = data.counter.lock().unwrap(); // <- get counter's MutexGuard
    *counter += 1; // <- access counter inside MutexGuard

    format!("Request number: {counter}") // <- response with count
}


async fn manual_hello() -> impl Responder {
    HttpResponse::Ok().body("Hey there!")
}

// TODO: реализовать получение сущьности и добавление route и возвращение
pub fn scope<AppEntry>(scope: Scope) -> Scope {
    scope
                   
}