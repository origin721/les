// @ts-check

import { APP_LOCAL_STORE_DIR_PATH } from "./APP_LOCAL_STORE_DIR_PATH.js";
import path from 'path';

export const APP_LOCAL_STORE_PATHS = Object.freeze({
  SECRETS: path.join(APP_LOCAL_STORE_DIR_PATH, 'secrets.json'),
})