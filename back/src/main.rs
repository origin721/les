mod modules;
mod utils;
use std::{path::{Path, PathBuf}, sync::Arc};

use utils::{RelativePathParams};

pub struct AppParams {
    port: u16,
    relative_path_params: RelativePathParams,
}


fn main() {
    let relative_path_params = RelativePathParams {
        current_file: file!().to_string(),
        relative_path: String::from("../dist"),
    };

    let appParams = AppParams {
        port: 8080,
        relative_path_params,
    };

    modules::create_server(appParams);
}
