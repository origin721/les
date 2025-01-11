// @ts-check

import path from 'path';
import { apply } from "../core/index.js";
import { app_config } from "../../app_config.js";
import { ROOT_DIR_PATH } from "./ROOT_DIR_PATH.js";

const {pathToTheLocalStorage} = app_config;

export const APP_LOCAL_STORE_DIR_PATH = apply(() => {
  if(pathToTheLocalStorage.type === 'RELATIVE') {
    return path.join(
      ROOT_DIR_PATH,
      pathToTheLocalStorage.path
    );
  }

  return path.join(pathToTheLocalStorage.path);
});