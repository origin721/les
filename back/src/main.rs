mod modules;
mod utils;
use std::{path::{Path, PathBuf}, sync::Arc};

use utils::{get_absolute_directory_path, get_absolute_path, get_absolute_path_dir, RelativePathParams, RelativePathParamsBase};

fn main() {
    let relative_path_params = RelativePathParams {
        current_file: file!().to_string(),
        relative_path: String::from("../dist"),
    };


    modules::create_server(relative_path_params);
}
