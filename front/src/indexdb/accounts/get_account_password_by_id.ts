import { decrypt_curve25519_from_pass } from "../../core/crypt";
import { indexdb_wrapper } from "../indexdb_wrapper";
import { get_accounts } from "./get_accounts";
import { devAuth, devDB, prodError, prodWarn } from "../../core/debug/logger";

/**
 * Получает пароль аккаунта по его ID, работает независимо от back_store
 * Используется в SharedWorker где back_store недоступен
 */
export function get_account_password_by_id(accountId: string): Promise<string | null> {
  return new Promise(async (resolve, reject) => {
    try {
      devAuth('Ищем пароль для аккаунта:', accountId);
      
      // Получаем все аккаунты для получения всех возможных паролей
      const accounts = await get_accounts();
      devDB('Получено аккаунтов:', accounts.length);
      
      if (accounts.length === 0) {
        prodWarn('Аккаунты не найдены для поиска пароля');
        resolve(null);
        return;
      }
      
      // Получаем все уникальные пароли для перебора
      const passwords = new Set<string>();
      for (const account of accounts) {
        if (account.pass) {
          passwords.add(account.pass);
        }
      }
      
      if (passwords.size === 0) {
        prodWarn('Пароли не найдены в аккаунтах');
        resolve(null);
        return;
      }
      
      devAuth('Найдено уникальных паролей для перебора:', passwords.size);
      
      // Теперь ищем конкретный аккаунт в IndexDB
      indexdb_wrapper((db) => {
        return new Promise((dbResolve, dbReject) => {
          const transaction = db.transaction(["accounts"], "readonly");
          const store = transaction.objectStore("accounts");
          
          const getRequest = store.get(accountId);
          
          getRequest.onerror = function(event) {
            prodError('IndexDB ошибка при получении аккаунта:', event);
            dbReject(event);
          };
          
          getRequest.onsuccess = async function(event) {
            try {
              const entity = (event.target as IDBRequest).result;
              if (!entity) {
                prodWarn('Аккаунт не найден в IndexDB:', accountId);
                resolve(null);
                dbResolve();
                return;
              }
              
              devAuth('Аккаунт найден в IndexDB, пробуем расшифровать');
              
              // Пробуем расшифровать каждым паролем
              for (const password of passwords) {
                try {
                  devAuth('Пробуем пароль длиной:', password.length);
                  
                  const decryptedData = await decrypt_curve25519_from_pass({
                    pass: password,
                    cipherText: entity.data,
                  });
                  
                  if (decryptedData) {
                    const account = JSON.parse(decryptedData);
                    if (account.id === accountId) {
                      devAuth('Найден правильный пароль для аккаунта:', accountId);
                      resolve(password);
                      dbResolve();
                      return;
                    }
                  }
                } catch (err) {
                  // Игнорируем ошибки расшифровки, пробуем следующий пароль
                  devAuth('Пароль не подошел, пробуем следующий');
                }
              }
              
              prodWarn('Ни один пароль не подошел для аккаунта:', accountId);
              resolve(null);
              dbResolve();
              
            } catch (err) {
              prodError('Критическая ошибка при расшифровке аккаунта:', err);
              dbReject(err);
            }
          };
        });
      });
      
    } catch (err) {
      console.error('❌ get_account_password_by_id: внешняя ошибка:', err);
      reject(err);
    }
  });
}
