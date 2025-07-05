// TODO: создать переменную с константой версии базы например
// LES_DB_VERSION = 1
// миграция каждых версий должна находится в папке migrate
// в папке migrate есть папки например 1 2 3 4 где миграция версии
// версия увеличивается на единицу если ниже версии нет папки меграция не нужна
// импортировать файлы из папки migration нужно
//             componentPromise = import(
//               `../../pages/accounts_new/ui/AccountNewPage.svelte`
//           );
// таким синтаксисом что бы в оперативку приложение не лезло!!!!



import { encrypt_curve25519_from_pass, decrypt_curve25519_from_pass } from "../../../../core/crypt";
import { back_store } from "../../../../local_back/back_store/back_store";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import { get_accounts } from "../get_accounts";
import { prodError, prodInfo, devMigration } from "../../../../core/debug/logger";

/**
 * Миграция существующих аккаунтов для добавления поля friendsByIds
 * Эта функция должна вызываться один раз при обновлении системы
 */
export function migrateAccountsFriends(): Promise<void> {
  return indexdb_wrapper((db) => {
    return new Promise<void>(async (res, rej) => {
      try {
        prodInfo('🔄 Начинаем миграцию аккаунтов для добавления поля friendsByIds');
        
        // Получаем все аккаунты
        const accounts = await get_accounts();
        let migratedCount = 0;
        
        if (accounts.length === 0) {
          prodInfo('✅ Нет аккаунтов для миграции');
          res();
          return;
        }

        const transaction = db.transaction(["accounts"], "readwrite");
        const store = transaction.objectStore("accounts");
        
        for (const account of accounts) {
          // Проверяем, есть ли уже поле friendsByIds
          if (account.friendsByIds !== undefined) {
            devMigration(`⏭️ Аккаунт ${account.id} уже содержит поле friendsByIds, пропускаем`);
            continue;
          }

          devMigration(`🔄 Мигрируем аккаунт ${account.id} (${account.namePub})`);
          
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

        transaction.oncomplete = function () {
          prodInfo(`✅ Миграция завершена. Обновлено аккаунтов: ${migratedCount}`);
          res();
        };

        transaction.onerror = function (event) {
          prodError("❌ Ошибка при миграции аккаунтов:", event);
          rej(new Error(`Ошибка миграции: ${JSON.stringify(event)}`));
        };

      } catch (error) {
        prodError('❌ Критическая ошибка в migrateAccountsFriends:', error);
        rej(error);
      }
    });
  }) as Promise<void>;
}

/**
 * Проверяет, нужна ли миграция аккаунтов
 * @returns true если есть аккаунты без поля friendsByIds
 */
export async function checkAccountsMigrationNeeded(): Promise<boolean> {
  try {
    const accounts = await get_accounts();
    
    // Проверяем, есть ли аккаунты без поля friendsByIds
    const needMigration = accounts.some(account => account.friendsByIds === undefined);
    
    if (needMigration) {
      prodInfo('🔍 Обнаружены аккаунты без поля friendsByIds, требуется миграция');
    } else {
      devMigration('✅ Все аккаунты уже содержат поле friendsByIds');
    }
    
    return needMigration;
  } catch (error) {
    prodError('❌ Ошибка проверки необходимости миграции:', error);
    return false;
  }
}

/**
 * Автоматическая миграция при инициализации приложения
 */
export async function autoMigrateAccounts(): Promise<void> {
  try {
    const needMigration = await checkAccountsMigrationNeeded();
    
    if (needMigration) {
      prodInfo('🚀 Автоматически запускаем миграцию аккаунтов');
      await migrateAccountsFriends();
      prodInfo('✅ Автоматическая миграция завершена');
    }
  } catch (error) {
    prodError('❌ Ошибка автоматической миграции:', error);
    // Не прерываем работу приложения из-за ошибки миграции
  }
}
