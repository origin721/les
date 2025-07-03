import { prodInfo, devMigration } from '../../core/debug/logger';

/**
 * Миграция версии 0 -> 1
 * Создание базовых object stores: accounts и friends
 */
export default function migrationV0ToV1(db: IDBDatabase): void {
  devMigration('📦 Выполняем миграцию v0 -> v1: создание базовых хранилищ');
  
  if (!db.objectStoreNames.contains('accounts')) {
    const accountsStore = db.createObjectStore('accounts', { keyPath: 'id' });
    prodInfo('✅ Хранилище accounts создано');
  }
  
  if (!db.objectStoreNames.contains('friends')) {
    const friendsStore = db.createObjectStore('friends', { keyPath: 'id' });
    prodInfo('✅ Хранилище friends создано');
  }
  
  prodInfo('✅ Миграция v0 -> v1 завершена');
}
