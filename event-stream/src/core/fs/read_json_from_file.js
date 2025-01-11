// @ts-check

import { readFile, stat } from 'fs/promises';
import { resolve } from 'path';

/**
 * По указаному пути проверяет есть ли файл, если есть то читает и приводит к json, во всех альтернативных случаях null возвращает
 * @param {string} filePath 
 */
export async function read_json_from_file(filePath) {
    try {
        // Преобразуем относительный путь в абсолютный
        const fullPath = resolve(filePath);

        // Проверим, существует ли файл
        await stat(fullPath);

        // Читаем содержимое файла
        const data = await readFile(fullPath, 'utf8');

        try {
            // Преобразуем содержимое в объект JSON
            const jsonData = JSON.parse(data);
            if (typeof jsonData === 'object') {
                return jsonData;
            }
        } catch (jsonError) {
            // Если JSON.parse не сработал
            console.error(`Ошибка при парсинге JSON из файла '${fullPath}':`, jsonError.message);
            return null;
        }

    } catch (error) {
        if (error.code === 'ENOENT') {
            // Если файл не существует
            console.warn(`Файл '${filePath}' не существует.`);
        } else {
            // Другие ошибки
            console.error(`Ошибка при чтении файла '${filePath}':`, error.message);
        }
        return null;
    }
}