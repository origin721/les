mod modules;
mod utils;
use std::{path::{Path, PathBuf}, sync::Arc};

use utils::{get_absolute_directory_path, get_absolute_path, RelativePathParams};

fn main() {
    let relative_path_params = RelativePathParams {
        current_file: file!().to_string(),
        relative_path: String::from("../dist"),
    };

    let dist_home = get_absolute_path(relative_path_params);
    print!("dist_home: {:?}", dist_home);
    // modules::create_server(relative_path_params);
}
