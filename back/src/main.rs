mod modules;
mod utils;
use std::{path::{Path, PathBuf}, sync::Arc};

use utils::{get_absolute_directory_path, get_absolute_path, get_absolute_path_dir, RelativePathParams, RelativePathParamsBase};

fn main() {
    let relative_path_params = RelativePathParams {
        current_file: file!().to_string(),
        relative_path: String::from("../dist"),
    };



    // let relative_path_params_base = ;


    // let dist_home = relative_path_params;
    // print!("dist_home: {:?}", dist_utils.get("/index.html"));
    modules::create_server(relative_path_params);
}
