/**
 * Миграция данных: добавление поля friendsByIds к существующим аккаунтам
 * Выполняется асинхронно после создания схемы БД
 */

import { encrypt_curve25519_from_pass } from "../../../core/crypt";
import { back_store } from "../../../local_back/back_store";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import { get_accounts } from "../../accounts/get_accounts";
import { forceLog } from "../../../core/debug/logger";

/**
 * Асинхронная миграция для добавления поля friendsByIds к аккаунтам
 */
export default async function dataMigrationAccountsFriends(): Promise<void> {
  forceLog('🔄 Начинаем миграцию данных аккаунтов для добавления поля friendsByIds');
  
  return indexdb_wrapper(async (db) => {
    try {
      // Получаем все аккаунты
      const accounts = await get_accounts();
      let migratedCount = 0;
      
      if (accounts.length === 0) {
        forceLog('✅ Нет аккаунтов для миграции');
        return;
      }

      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");
      
      for (const account of accounts) {
        // Проверяем, есть ли уже поле friendsByIds
        if (account.friendsByIds !== undefined) {
          forceLog(`⏭️ Аккаунт ${account.id} уже содержит поле friendsByIds, пропускаем`);
          continue;
        }

        forceLog(`🔄 Мигрируем аккаунт ${account.id} (${account.namePub})`);
        
        // Добавляем поле friendsByIds
        const updatedAccount = {
          ...account,
          friendsByIds: [], // Инициализируем пустым массивом
          date_updated: new Date(),
        };

        // Шифруем обновленные данные
        const newData = await encrypt_curve25519_from_pass({
          pass: account.pass,
          message: JSON.stringify(updatedAccount),
        });
        
        // Сохраняем в IndexedDB
        store.put({ id: account.id, data: newData });
        
        // Обновляем back_store
        back_store.accounts_by_id[account.id] = updatedAccount;
        
        migratedCount++;
      }

      return new Promise<void>((resolve, reject) => {
        transaction.oncomplete = function () {
          forceLog(`✅ Миграция данных аккаунтов завершена. Обновлено аккаунтов: ${migratedCount}`);
          resolve();
        };

        transaction.onerror = function (event) {
          console.error("❌ Ошибка при миграции данных аккаунтов:", event);
          reject(new Error(`Ошибка миграции: ${JSON.stringify(event)}`));
        };
      });

    } catch (error) {
      console.error('❌ Критическая ошибка в dataMigrationAccountsFriends:', error);
      throw error;
    }
  }) as Promise<void>;
}
