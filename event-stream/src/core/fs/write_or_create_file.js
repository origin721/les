// @ts-check

import { writeFile } from 'fs/promises';
import { dirname } from 'path';
import { mkdir } from 'fs/promises';

/**
 * 
 * @param {string} filePath 
 * @param {string} content 
 */
export async function write_or_create_file(filePath, content) {
  try {
    // Создаём все родительские директории, если они отсутствуют
    await mkdir(dirname(filePath), { recursive: true });

    // Перезаписываем файл или создаём новый, если он отсутствует
    await writeFile(filePath, content, 'utf8');

    console.log(`Файл успешно записан: ${filePath}`);
  } catch (error) {
    console.error(`Ошибка при записи файла '${filePath}':`, error.message);
    throw error; // Прокидываем ошибку дальше, если нужно обработать её на уровне вызова
  }
}