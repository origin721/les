use std::fs;
use std::io;
use std::path::{Path, PathBuf};

pub fn read_files_from_dir(path: String) -> Vec<String> {
    let mut files_list: Vec<String> = Vec::new();

    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                // println!("PATH: {:?}", path);

                // Если это файл, добавляем его в список
                if path.is_file() {
                    if let Some(path_str) = path.to_str() {
                        files_list.push(path_str.to_string());
                    }
                }

                // Если это директория, рекурсивно вызываем функцию для неё
                if path.is_dir() {
                    if let Some(dir_name) = path.to_str() {
                        files_list.extend(read_files_from_dir(dir_name.to_string()));
                    }
                }
            }
        }
    }

    files_list
}

#[derive(Clone)]
pub struct RelativePathParams {
    pub current_file: String,
    pub relative_path: String,
}

pub fn get_absolute_directory_path(params: RelativePathParams) -> String {
    // Преобразуем строки в Path
    let base_path = Path::new(&params.current_file);
    let relative_path = Path::new(&params.relative_path);

    // Объединяем базовый путь и относительный путь
    let full_path = base_path.join(relative_path);

    match fs::canonicalize(full_path) {
        Ok(abs_path) => {
            let result = abs_path.to_string_lossy().to_string();
            print!("MY_RESLLL: {}", result);
            result
        }
        Err(_) => String::new(), // Возвращаем пустую строку в случае ошибки
    }

    // Получаем родительскую директорию из полного пути
    // let dir_path = full_path.parent().unwrap_or(Path::new("ErrorPath!!!((("));

    // // dir_path.to_str()
    // dir_path.to_str().unwrap_or("Unknown directory").to_string()

    // Преобразуем в абсолютный путь, если это не абсолютный путь
    // let abs_dir_path = dir_path.canonicalize().ok()?;

    // Some(abs_dir_path.to_string_lossy().to_string())
}

pub fn get_directory_path(params: RelativePathParams) -> Option<PathBuf> {
    // Преобразуем строки в Path
    let current_file_path = Path::new(&params.current_file);
    let relative_path = Path::new(&params.relative_path);

    // Объединяем текущий файл и относительный путь
    let full_path = current_file_path.join(relative_path);

    // Получаем директорию из полного пути
    let dir_path = full_path.parent()?;

    Some(dir_path.to_path_buf())
}

pub fn read_files_from_dir_relative(params: RelativePathParams) -> Vec<String> {
    match get_absolute_path(params) {
        Some(result) => read_files_from_dir(result),
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
    let current_file_path = Path::new(&params.current_file);

    let current_dir = current_file_path.parent()?;

    // Получаем родительский путь текущего файла (директория, где он находится)
    // let current_dir = match current_file_path.parent() {
    //     Some(dir) => dir.to_path_buf(),
    //     None => return String::new(),
    // };

    // Соединяем родительскую директорию с относительным путем
    let combined_path = current_dir.join(params.relative_path);

    fs::canonicalize(combined_path)
        .ok()
        .and_then(|abs_path| abs_path.to_str().map(|s| s.to_string()))

    // Преобразуем в абсолютный путь (canonicalize вернёт полный путь от корня файловой системы)
    // match fs::canonicalize(combined_path) {
    //     Ok(abs_path) => abs_path.to_string_lossy().to_string(),
    //     Err(_) => String::new(),
    // }
}

pub fn get_absolute_path_dir(params: RelativePathParams) -> String {
    // Получаем путь до директории, где находится текущий файл
    let current_file_path = Path::new(&params.current_file);

    let current_dir = current_file_path.parent();

    // Получаем родительский путь текущего файла (директория, где он находится)
    let current_dir = match current_file_path.parent() {
        Some(dir) => dir.to_path_buf(),
        None => return String::new(),
    };

    // Соединяем родительскую директорию с относительным путем
    let combined_path = current_dir.join(params.relative_path);


    // Преобразуем в абсолютный путь (canonicalize вернёт полный путь от корня файловой системы)
    match fs::canonicalize(combined_path) {
        Ok(abs_path) => abs_path.to_string_lossy().to_string(),
        Err(_) => String::new(),
    }
}