import { prodInfo, devDB } from '../../../../core/debug/logger';
import type { MigrationInfo, MigrationFunction } from '../types';
import type { MigrationContext } from '../../../db_state_manager_v1/constants';
import { TABLE_NAMES } from '../../entities/constats/TABLE_NAMES';

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

  if (!db.objectStoreNames.contains(TABLE_NAMES.friends_ids)) {
    db.createObjectStore(TABLE_NAMES.friends_ids, { keyPath: 'id' });
    devDB(`✅ Хранилище ${TABLE_NAMES.friends_ids} создано`);
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
export async function migrationData(context: MigrationContext): Promise<void> {
  const { currentUser } = context;
  prodInfo(`📦 Выполняем миграцию данных 0 для пользователя: ${currentUser.id}`);
  
  // При инициализации нет данных для миграции
  prodInfo(`✅ Миграция данных 0 завершена для пользователя ${currentUser.id} (нет данных для миграции)`);
}
