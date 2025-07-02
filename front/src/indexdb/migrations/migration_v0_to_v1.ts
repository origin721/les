import { forceLog } from '../../core/debug/logger';

/**
 * Миграция версии 0 -> 1
 * Создание базовых object stores: accounts и friends
 */
export default function migrationV0ToV1(db: IDBDatabase): void {
  forceLog('📦 Выполняем миграцию v0 -> v1: создание базовых хранилищ');
  
  if (!db.objectStoreNames.contains('accounts')) {
    const accountsStore = db.createObjectStore('accounts', { keyPath: 'id' });
    forceLog('✅ Хранилище accounts создано');
  }
  
  if (!db.objectStoreNames.contains('friends')) {
    const friendsStore = db.createObjectStore('friends', { keyPath: 'id' });
    forceLog('✅ Хранилище friends создано');
  }
  
  forceLog('✅ Миграция v0 -> v1 завершена');
}
