mod modules;
mod utils;
use std::{path::{Path, PathBuf}, sync::Arc};

use utils::RelativePathParams;

fn main() {
    let relative_path_params = RelativePathParams {
        current_file: file!().to_string(),
        relative_path: String::from("../dist"),
    };

    modules::create_server(relative_path_params);
}
