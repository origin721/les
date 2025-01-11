// @ts-check
import { get_dirname } from "../core/fs/get_dirname.js";
import path from 'path';

/**
 * Путь до корня проекта
 */
export const ROOT_DIR_PATH = path.join(
  get_dirname(import.meta.url),
  '..',
  '..'
)