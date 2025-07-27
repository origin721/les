import { devDB, prodInfo } from '../../../core/debug/logger';
import { TABLE_NAMES } from '../entities/constats/TABLE_NAMES';

/**
 * Выполняет экстренные встроенные миграции схемы БД
 * Используется когда предзагруженные миграции недоступны
 */
export function runEmergencyMigrations({
  db,
  realOldVersion,
  newVersion
}: {
  db: IDBDatabase;
  realOldVersion: number;
  newVersion: number;
}): void {
  prodInfo('🚨 Экстренное выполнение встроенных миграций схемы');
  
  // Выполняем все миграции от 0 до нужной версии
  for (let migrationVersion = 0; migrationVersion < newVersion; migrationVersion++) {
    
    // Миграция 0: создание базовых stores
    if (migrationVersion === 0 && realOldVersion <= 0) {
      prodInfo('📦 Экстренная миграция схемы 0: Создание базовых хранилищ');
      
      if (!db.objectStoreNames.contains(TABLE_NAMES.accounts)) {
        db.createObjectStore(TABLE_NAMES.accounts, { keyPath: 'id' });
        prodInfo('✅ Хранилище accounts создано');
      }
      
      if (!db.objectStoreNames.contains(TABLE_NAMES.friends)) {
        db.createObjectStore(TABLE_NAMES.friends, { keyPath: 'id' });
        prodInfo('✅ Хранилище friends создано');
      }
      
      if (!db.objectStoreNames.contains(TABLE_NAMES.rooms)) {
        db.createObjectStore(TABLE_NAMES.rooms, { keyPath: 'id' });
        prodInfo('✅ Хранилище rooms создано');
      }

     //if (!db.objectStoreNames.contains(TABLE_NAMES.friends_ids)) {
     //  db.createObjectStore(TABLE_NAMES.friends_ids, { keyPath: 'id' });
     //  devDB(`✅ Хранилище ${TABLE_NAMES.friends_ids} создано`);
     //}
      
      prodInfo('✅ Экстренная миграция схемы 0 завершена');
    }
    
      if (!db.objectStoreNames.contains(TABLE_NAMES.friends_ids)) {
        db.createObjectStore(TABLE_NAMES.friends_ids, { keyPath: 'id' });
        devDB(`✅ Хранилище ${TABLE_NAMES.friends_ids} создано`);
      }

    // Миграция 1: добавление индексов
    if (migrationVersion === 1 && realOldVersion <= 1) {
      prodInfo('📦 Экстренная миграция схемы 1: Добавление индексов');
      // Логика для добавления индексов, если необходимо
      prodInfo('✅ Экстренная миграция схемы 1 завершена');
    }
  }
  
  // Дополнительная проверка: создаем базовые хранилища, если они отсутствуют
  prodInfo('🔍 Дополнительная проверка наличия критических хранилищ...');
  if (!db.objectStoreNames.contains('accounts')) {
    db.createObjectStore('accounts', { keyPath: 'id' });
    prodInfo('✅ Дополнительно создано хранилище accounts');
  }
  
  if (!db.objectStoreNames.contains('friends')) {
    db.createObjectStore('friends', { keyPath: 'id' });
    prodInfo('✅ Дополнительно создано хранилище friends');
  }
  
  if (!db.objectStoreNames.contains('rooms')) {
    db.createObjectStore('rooms', { keyPath: 'id' });
    prodInfo('✅ Дополнительно создано хранилище rooms');
  }
}
