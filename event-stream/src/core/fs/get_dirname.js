// @ts-check
import { dirname } from 'path';
import { get_filename } from './get_filename.js';

/**
 * @example  ```js
 * get_dirname(import.meta.url)
 * ```
 * @param {string} import_meta_url 
 */
export function get_dirname(import_meta_url) {
  return dirname(get_filename(import_meta_url));
}