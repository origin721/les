/**
 * Миграция версии 0 -> 1
 * Создание базовых object stores: accounts и friends
 */
export default function migrationV0ToV1(db: IDBDatabase): void {
  console.log('📦 Выполняем миграцию v0 -> v1: создание базовых хранилищ');
  
  if (!db.objectStoreNames.contains('accounts')) {
    const accountsStore = db.createObjectStore('accounts', { keyPath: 'id' });
    console.log('✅ Хранилище accounts создано');
  }
  
  if (!db.objectStoreNames.contains('friends')) {
    const friendsStore = db.createObjectStore('friends', { keyPath: 'id' });
    console.log('✅ Хранилище friends создано');
  }
  
  console.log('✅ Миграция v0 -> v1 завершена');
}
