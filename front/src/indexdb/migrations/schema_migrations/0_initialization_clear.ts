import { prodInfo, devDB } from '../../../core/debug/logger';

/**
 * Миграция 0: Инициализация базы данных с базовыми хранилищами
 * Создает начальную структуру БД с accounts, friends и rooms
 */
export function migration_0_initialization_clear(db: IDBDatabase): void {
  prodInfo('📦 Выполняем миграцию 0: Создание базовых хранилищ');
  
  // Создание хранилища accounts
  if (!db.objectStoreNames.contains('accounts')) {
    db.createObjectStore('accounts', { keyPath: 'id' });
    devDB('✅ Хранилище accounts создано');
  }
  
  // Создание хранилища friends  
  if (!db.objectStoreNames.contains('friends')) {
    db.createObjectStore('friends', { keyPath: 'id' });
    devDB('✅ Хранилище friends создано');
  }
  
  // Создание хранилища rooms
  if (!db.objectStoreNames.contains('rooms')) {
    db.createObjectStore('rooms', { keyPath: 'id' });
    devDB('✅ Хранилище rooms создано');
  }
  
  prodInfo('✅ Миграция 0 завершена успешно');
}

export const migrationInfo = {
  version: 0,
  name: 'initialization_clear',
  description: 'Создание базовых хранилищ accounts, friends, rooms',
  fileName: '0_initialization_clear.ts'
};
