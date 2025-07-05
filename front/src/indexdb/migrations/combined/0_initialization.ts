import { prodInfo, devDB } from '../../../core/debug/logger';

/**
 * Информация о миграции
 */
export const migrationInfo = {
  version: 0,
  name: 'initialization',
  description: 'Создание базовых хранилищ accounts, friends, rooms',
  fileName: '0_initialization.ts'
};

/**
 * Миграция схемы: Инициализация базы данных с базовыми хранилищами
 * Создает начальную структуру БД с accounts, friends и rooms
 */
export function migrationScheme(db: IDBDatabase): void {
  prodInfo('📦 Выполняем миграцию схемы 0: Создание базовых хранилищ');
  
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
  
  prodInfo('✅ Миграция схемы 0 завершена успешно');
}

/**
 * Миграция данных: Инициализация - нет данных для миграции
 */
export async function migrationData(db: IDBDatabase): Promise<void> {
  prodInfo('📦 Выполняем миграцию данных 0: Инициализация');
  
  // При инициализации нет данных для миграции
  prodInfo('✅ Миграция данных 0 завершена (нет данных для миграции)');
}
