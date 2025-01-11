// @ts-check
import { fileURLToPath } from 'url';

/**
 * @example  ```js
 * get_filename(import.meta.url)
 * ```
 * @param {string} import_meta_url 
 */
export function get_filename(import_meta_url) {
  return fileURLToPath(import_meta_url);
}
