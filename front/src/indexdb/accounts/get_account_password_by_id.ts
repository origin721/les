import { decrypt_curve25519_from_pass } from "../../core/crypt";
import { indexdb_wrapper } from "../indexdb_wrapper";
import { get_accounts } from "./get_accounts";

/**
 * Получает пароль аккаунта по его ID, работает независимо от back_store
 * Используется в SharedWorker где back_store недоступен
 */
export function get_account_password_by_id(accountId: string): Promise<string | null> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('🔍 get_account_password_by_id: ищем пароль для аккаунта', accountId);
      
      // Получаем все аккаунты для получения всех возможных паролей
      const accounts = await get_accounts();
      console.log('📋 get_account_password_by_id: получено аккаунтов:', accounts.length);
      
      if (accounts.length === 0) {
        console.log('❌ get_account_password_by_id: аккаунты не найдены');
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
        console.log('❌ get_account_password_by_id: пароли не найдены');
        resolve(null);
        return;
      }
      
      console.log('🔐 get_account_password_by_id: найдено уникальных паролей:', passwords.size);
      
      // Теперь ищем конкретный аккаунт в IndexDB
      indexdb_wrapper((db) => {
        return new Promise((dbResolve, dbReject) => {
          const transaction = db.transaction(["accounts"], "readonly");
          const store = transaction.objectStore("accounts");
          
          const getRequest = store.get(accountId);
          
          getRequest.onerror = function(event) {
            console.error('❌ get_account_password_by_id: ошибка IndexDB:', event);
            dbReject(event);
          };
          
          getRequest.onsuccess = async function(event) {
            try {
              const entity = (event.target as IDBRequest).result;
              if (!entity) {
                console.log('❌ get_account_password_by_id: аккаунт не найден в IndexDB:', accountId);
                resolve(null);
                dbResolve();
                return;
              }
              
              console.log('✅ get_account_password_by_id: аккаунт найден в IndexDB, пробуем расшифровать');
              
              // Пробуем расшифровать каждым паролем
              for (const password of passwords) {
                try {
                  console.log('🔐 get_account_password_by_id: пробуем пароль длиной:', password.length);
                  
                  const decryptedData = await decrypt_curve25519_from_pass({
                    pass: password,
                    cipherText: entity.data,
                  });
                  
                  if (decryptedData) {
                    const account = JSON.parse(decryptedData);
                    if (account.id === accountId) {
                      console.log('✅ get_account_password_by_id: найден правильный пароль для аккаунта:', accountId);
                      resolve(password);
                      dbResolve();
                      return;
                    }
                  }
                } catch (err) {
                  // Игнорируем ошибки расшифровки, пробуем следующий пароль
                  console.log('🔄 get_account_password_by_id: пароль не подошел, пробуем следующий');
                }
              }
              
              console.log('❌ get_account_password_by_id: ни один пароль не подошел для аккаунта:', accountId);
              resolve(null);
              dbResolve();
              
            } catch (err) {
              console.error('❌ get_account_password_by_id: критическая ошибка:', err);
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
