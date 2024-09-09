use std::fs;
use std::io;
use std::path::{Path, PathBuf};


pub fn read_files_from_dir(path: &str) -> Vec<String> {
    let mut files_list: Vec<String> = Vec::new();

    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                println!("PATH: {:?}", path);

                // Если это файл, добавляем его в список
                if path.is_file() {
                    if let Some(path_str) = path.to_str() {
                        files_list.push(path_str.to_string());
                    }
                }

                // Если это директория, рекурсивно вызываем функцию для неё
                if path.is_dir() {
                    if let Some(dir_name) = path.to_str() {
                        files_list.extend(read_files_from_dir(dir_name));
                    }
                }
            }
        }
    }


    files_list
}

pub struct  RelativePathParams<'a> {
    pub current_file: &'a String,
    pub relative_path: &'a String,
}

pub fn read_files_from_dir_relative(params: RelativePathParams) -> Vec<String> {
    match get_absolute_path(params) {
        Some(result) => read_files_from_dir(&result),
        None => Vec::new(),
    }
}

pub fn read_file_contents(path: &str) -> Result<String, io::Error> {
    // Читаем содержимое файла в строку
    // print!("ARG_PATH: {}", path);
    let contents = fs::read_to_string(path)?;
    // let contents = fs::read_to_string(path)?;

    // Возвращаем содержимое файла
    Ok(contents)
}

pub fn get_absolute_path(params: RelativePathParams) -> Option<String> {
    // Получаем путь до директории, где находится текущий файл
    let current_file_path = Path::new(params.current_file);
    
    // Получаем родительский путь текущего файла (директория, где он находится)
    let current_dir = current_file_path.parent()?;

    // Соединяем родительскую директорию с относительным путем
    let combined_path = current_dir.join(params.relative_path);

    // Преобразуем в абсолютный путь (canonicalize вернёт полный путь от корня файловой системы)
    fs::canonicalize(combined_path)
        .ok()
        .and_then(|abs_path| abs_path.to_str().map(|s| s.to_string()))
}