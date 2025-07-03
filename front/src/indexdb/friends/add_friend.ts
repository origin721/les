//import { AES } from "../../../core/crypt";
import { encrypt_curve25519_from_pass } from "../../core/crypt";
import { gen_pass } from "../../core/random/gen_pass";
import { uuidv4 } from "../../core/uuid";
import { indexdb_wrapper } from "../indexdb_wrapper";
import { privateKeyToString, recommendedGenerateKeyPair } from "../../libs/libp2p";
import { back_store } from "../../local_back/back_store";
import { updateAccountFriendsList } from "../accounts/update_account_friends";
import { forceLog } from "../../core/debug/logger";
import { get_account_password_by_id } from "../accounts/get_account_password_by_id";
import { get_accounts } from "../accounts/get_accounts";

export type FriendEntityFull = {
  id: string;
} & FriendEntity;

export type FriendEntity = {
  namePub: string;
  // TODO: сделать проверку что расшифрованный accId соотвествует если буду по той таблице идти
  myAccId: string;
  friendPubKeyLibp2p: string;
}
// Функция принимает список друзей и опциональный myAccId для получения пароля
export function add_friend(
  new_list: FriendEntity[],
  explicitMyAccId?: string // Явно переданный ID аккаунта
) {
  forceLog('🔥 add_friend начинает работу с данными:', new_list, 'explicitMyAccId:', explicitMyAccId);
  forceLog('🔍 back_store.accounts_by_id:', back_store.accounts_by_id);
  
  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {
      try {
        forceLog('📦 IndexDB transaction создана');
        const transaction = db.transaction(["friends"], "readwrite");
        const store = transaction.objectStore("friends");
        
        // Убеждаемся, что аккаунты загружены в back_store для оптимизации
        if (Object.keys(back_store.accounts_by_id).length === 0) {
          forceLog('🔄 back_store.accounts_by_id пустой, загружаем аккаунты...');
          const accounts = await get_accounts();
          for (let ac of accounts) {
            back_store.accounts_by_id[ac.id] = ac;
          }
          forceLog('✅ Аккаунты загружены в back_store:', Object.keys(back_store.accounts_by_id));
        }

        // Сохраняем сгенерированные ID для синхронизации
        const friendsWithIds: Array<{ item: FriendEntity; id: string }> = [];
        
        // Добавляем запись
        for (let item of new_list) {
          forceLog('🔄 Обрабатываем друга:', item);
          const newId = uuidv4();
          forceLog('🆔 Сгенерирован ID:', newId);
          
          // Сохраняем ID для дальнейшей синхронизации
          friendsWithIds.push({ item, id: newId });
          
          // Используем либо явно переданный myAccId, либо берем из item
          const accountId = explicitMyAccId || item.myAccId;
          forceLog('🔍 Используем accountId:', accountId);
          
          // Оптимизация: сначала пробуем получить пароль из кеша back_store
          let accountPassword: string | null = null;
          
          const cachedAccount = back_store.accounts_by_id[accountId];
          if (cachedAccount && cachedAccount.pass) {
            accountPassword = cachedAccount.pass;
            forceLog('🚀 Пароль получен из back_store кеша для аккаунта:', accountId);
          } else {
            // Fallback на медленный способ через IndexDB
            forceLog('⚠️ Аккаунт не найден в кеше, используем get_account_password_by_id для:', accountId);
            accountPassword = await get_account_password_by_id(accountId);
            forceLog('🔐 Получен пароль через IndexDB для аккаунта:', accountId, accountPassword ? 'найден' : 'не найден');
          }
          
          if (!accountPassword) {
            console.error('❌ Пароль для аккаунта не найден:', accountId);
            rej(new Error(`Пароль для аккаунта ${accountId} не найден`));
            return;
          }
          
          forceLog('🔐 Начинаем шифрование...');
          const dataToEncrypt = {
            ...item,
            id: newId,
            date_created: new Date(),
          };
          forceLog('📝 Данные для шифрования:', dataToEncrypt);
          forceLog('🔐 Пароль для шифрования длиной:', accountPassword.length, 'символов');
          
          try {
            forceLog('⏰ Вызываем encrypt_curve25519_from_pass...');
            const encryptStartTime = Date.now();
            
            const newData = await encrypt_curve25519_from_pass({
              pass: accountPassword,
              message: JSON.stringify(dataToEncrypt),
            });
            
            const encryptDuration = Date.now() - encryptStartTime;
            forceLog('✅ Шифрование завершено за', encryptDuration, 'мс');
            forceLog('📊 Размер зашифрованных данных:', newData?.length || 'undefined');
            
            forceLog('💾 Добавляем в IndexDB...');
            const storeStartTime = Date.now();
            
            const addRequest = store.add({ id: newId, data: newData });
            
            addRequest.onsuccess = function() {
              const storeDuration = Date.now() - storeStartTime;
              forceLog('✅ store.add успешно завершен за', storeDuration, 'мс для ID:', newId);
            };
            
            addRequest.onerror = function(event) {
              forceLog('❌ store.add ошибка для ID:', newId, 'event:', event);
            };
            
          } catch (encryptError) {
            forceLog('❌ Ошибка шифрования:', encryptError);
            rej(encryptError);
            return;
          }
        }

        transaction.oncomplete = async function () {
          forceLog("🎉 Transaction oncomplete triggered!");
          forceLog("✅ Данные добавлены успешно в IndexDB");
          
          // Синхронизируем с аккаунтами - добавляем ID друзей в friendsByIds
          try {
            // Группируем друзей по аккаунтам для более эффективной синхронизации
            const friendsByAccount: Record<string, string[]> = {};
            
            for (const { item, id } of friendsWithIds) {
              if (!friendsByAccount[item.myAccId]) {
                friendsByAccount[item.myAccId] = [];
              }
              friendsByAccount[item.myAccId].push(id);
            }
            
            // Обновляем каждый аккаунт с тайм-аутом
            for (const [accountId, friendIds] of Object.entries(friendsByAccount)) {
              forceLog('🔄 Синхронизация аккаунта:', accountId, 'с друзьями:', friendIds);
              
              try {
                // Создаем промис с тайм-аутом для updateAccountFriendsList
                const updatePromise = updateAccountFriendsList(accountId, {
                  add: friendIds
                });
                
                const timeoutPromise = new Promise<never>((_, reject) => 
                  setTimeout(() => {
                    forceLog(`⏰ TIMEOUT: updateAccountFriendsList для аккаунта ${accountId} превысил 8 секунд`);
                    reject(new Error(`updateAccountFriendsList timeout for account ${accountId}`));
                  }, 8000)
                );
                
                // Ждем либо завершения обновления, либо тайм-аута
                await Promise.race([updatePromise, timeoutPromise]);
                forceLog(`✅ Синхронизация аккаунта ${accountId} завершена успешно`);
                
              } catch (syncError) {
                forceLog(`❌ Ошибка синхронизации аккаунта ${accountId}:`, syncError);
                console.error(`❌ Sync error for account ${accountId}:`, syncError);
                // Не прерываем выполнение, продолжаем с другими аккаунтами
              }
            }
            
            forceLog('✅ Синхронизация с аккаунтами завершена (включая возможные ошибки)');
          } catch (error) {
            forceLog('❌ Критическая ошибка синхронизации с аккаунтами:', error);
            console.error('❌ Ошибка синхронизации с аккаунтами:', error);
            // Не прерываем выполнение, так как друзья уже добавлены
          }
          
          forceLog('🎯 Вызываем res() для завершения add_friend');
          res();
        };

        transaction.onerror = function (event) {
          forceLog("❌ Transaction onerror triggered!");
          console.error("❌ Ошибка при добавлении данных в IndexDB:", event);
          rej(new Error(`IndexDB error: ${JSON.stringify(event)}`));
        };

        transaction.onabort = function (event) {
          forceLog("❌ Transaction onabort triggered!");
          console.error("❌ Transaction была прервана:", event);
          rej(new Error(`IndexDB transaction aborted: ${JSON.stringify(event)}`));
        };
      } catch (error) {
        console.error('❌ Критическая ошибка в add_friend:', error);
        rej(error);
      }
    });
  })
}
