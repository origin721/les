import { mkdir } from 'fs/promises';
import { resolve } from 'path';


export async function create_recursive_dir_by_path(dirPath) {
    try {
        // Преобразуем относительный путь в абсолютный
        const fullPath = resolve(dirPath);

        // Рекурсивно создаём директории
        await mkdir(fullPath, { recursive: true });
        //console.log(`Папка '${fullPath}' успешно создана (или уже существовала).`);
    } catch (error) {
        // Если возникла ошибка, отклоняем промис
        console.error(`Не удалось создать папку '${dirPath}':`, error.message);
        throw error;
    }
}