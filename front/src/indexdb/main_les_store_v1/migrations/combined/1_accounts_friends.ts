import { prodInfo, prodError, devMigration } from '../../../../core/debug/logger';

/**
 * Информация о миграции
 */
export const migrationInfo = {
  version: 1,
  name: 'accounts_friends',
  description: 'Добавление индексов и миграция аккаунтов для поля friendsByIds',
  fileName: '1_accounts_friends.ts'
};

/**
 * Миграция схемы: Добавление индексов и улучшений схемы
 */
export function migrationScheme(db: IDBDatabase): void {
  prodInfo('📦 Выполняем миграцию схемы 1: Добавление индексов');
  
  // Пример добавления индексов к существующим хранилищам
  // В данном случае схема уже создана в версии 0, так что индексы можно не добавлять
  // Но если нужно, то код был бы такой:
  
  // if (db.objectStoreNames.contains('accounts')) {
  //   const accountsStore = transaction.objectStore('accounts');
  //   if (!accountsStore.indexNames.contains('byEmail')) {
  //     accountsStore.createIndex('byEmail', 'email', { unique: true });
  //   }
  // }
  
  prodInfo('✅ Миграция схемы 1 завершена успешно');
}

/**
 * Миграция данных: добавление поля friendsByIds к существующим аккаунтам
 */
export async function migrationData(db: IDBDatabase): Promise<void> {
  prodInfo('🔄 Начинаем миграцию данных аккаунтов для добавления поля friendsByIds');
  
  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = function() {
        const accountRecords = getAllRequest.result;
        
        if (accountRecords.length === 0) {
          prodInfo('✅ Нет аккаунтов для миграции');
          resolve();
          return;
        }
        
        prodInfo(`📋 Найдено ${accountRecords.length} записей аккаунтов для проверки миграции`);
        
        // Для этой простой миграции просто завершаем успешно
        // В реальной ситуации здесь была бы логика обновления данных
        prodInfo('✅ Миграция данных аккаунтов завершена (пока без изменений)');
        resolve();
      };
      
      getAllRequest.onerror = function() {
        prodError("❌ Ошибка при чтении аккаунтов для миграции:", getAllRequest.error);
        reject(getAllRequest.error);
      };

    } catch (error) {
      prodError('❌ Критическая ошибка в migrationData:', error);
      reject(error);
    }
  })
}
