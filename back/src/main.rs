// mod modules;
mod utils;
use std::path::{Path, PathBuf};


fn main()  {
    let relative_path = "./utils/mod.rs";
    let current_file = file!();

    let asd = match utils::get_absolute_path(current_file, relative_path) {
        Some(abs_path) => println!("Абсолютный путь: {}", abs_path),
        None => println!("Ошибка преобразования в абсолютный путь"),
    };

    // let current_file = Path::new(file!());
    // print!("{}", current_file.to_str());
    // let relative_path = "./"; // Относительный путь
    // match utils::get_absolute_path(relative_path) {
    //     Ok(absolute_path) => println!("Абсолютный путь: {}", absolute_path),
    //     Err(e) => println!("Ошибка: {}", e),
    // }
    let path = "./dist";  // Указываем относительный путь
    let files = utils::read_files_from_dir_relative(file!(),path);
    for file in files {
        println!("{}", file);  // Выводим каждый файл в консоль
    }

    // modules::create_server();
}
