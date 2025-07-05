import { prodInfo, devDB } from '../../../core/debug/logger';

/**
 * Миграция 1: Добавление индексов и дополнительных хранилищ
 * Пример расширения схемы БД
 */
export async function migration_1_add_indexes_example(db: IDBDatabase): Promise<void> {
  prodInfo('📦 Выполняем миграцию 1: Добавление индексов');
  
  // Пример добавления нового хранилища
  if (!db.objectStoreNames.contains('settings')) {
    const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
    
    // Добавляем индексы
    settingsStore.createIndex('category', 'category', { unique: false });
    settingsStore.createIndex('updated_at', 'updatedAt', { unique: false });
    
    devDB('✅ Хранилище settings создано с индексами');
  }
  
  // Пример добавления индексов в существующие хранилища
  // Примечание: в реальности это требует более сложной логики для проверки существования индексов
  
  prodInfo('✅ Миграция 1 завершена успешно');
}

export const migrationInfo = {
  version: 1,
  name: 'add_indexes_example',
  description: 'Добавление индексов и хранилища settings',
  fileName: '1_add_indexes_example.ts'
};
