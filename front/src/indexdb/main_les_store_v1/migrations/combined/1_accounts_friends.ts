import { prodInfo, prodError, devMigration } from '../../../../core/debug/logger';
import type { MigrationContext } from '../../../db_state_manager_v1/constants';

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
export async function migrationData(context: MigrationContext): Promise<void> {
  const { db, currentUser } = context;
  prodInfo(`🔄 Выполняем миграцию данных 1 для пользователя: ${currentUser.id}`);
  
  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = function() {
        const allAccountRecords = getAllRequest.result;
        
        // ✅ Фильтрация по конкретному пользователю
        const userAccounts = allAccountRecords.filter(account => account.id === currentUser.id);
        
        if (userAccounts.length === 0) {
          prodInfo(`✅ Нет аккаунтов для миграции для пользователя ${currentUser.id}`);
          resolve();
          return;
        }
        
        prodInfo(`📋 Найдено ${userAccounts.length} записей аккаунтов для пользователя ${currentUser.id}`);
        
        // ✅ Обработка данных с учетом пользователя
        // TODO: Здесь будет логика дешифровки с currentUser.pass
        // TODO: Здесь будет логика обновления данных конкретного пользователя
        
        // Пример обновления (если нужно добавить поле friendsByIds):
        // for (const account of userAccounts) {
        //   if (!account.friendsByIds) {
        //     account.friendsByIds = [];
        //     // Дешифровать данные с currentUser.pass
        //     // Обновить запись в базе
        //   }
        // }
        
        prodInfo(`✅ Миграция данных 1 завершена для пользователя ${currentUser.id}`);
        resolve();
      };
      
      getAllRequest.onerror = function() {
        prodError(`❌ Ошибка при чтении аккаунтов для пользователя ${currentUser.id}:`, getAllRequest.error);
        reject(getAllRequest.error);
      };

    } catch (error) {
      prodError(`❌ Критическая ошибка в migrationData для пользователя ${currentUser.id}:`, error);
      reject(error);
    }
  })
}
