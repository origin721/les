//import { AES } from "../../../core/crypt";
import { encrypt_curve25519_from_pass } from "../../core/crypt";
import { gen_pass } from "../../core/random/gen_pass";
import { uuidv4 } from "../../core/uuid";
import { indexdb_wrapper } from "../indexdb_wrapper";
import { privateKeyToString, recommendedGenerateKeyPair } from "../../libs/libp2p";
import { back_store } from "../../local_back/back_store/back_store";
import { prodError, prodInfo, devDB, devCrypto, devAuth } from "../../core/debug/logger";
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
  devDB('🔄 Добавление друзей начато, количество:', new_list.length, 'explicitMyAccId:', explicitMyAccId);
  devDB('🔍 back_store.accounts_by_id:', back_store.accounts_by_id);
  
  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {
      try {
        devDB('📦 IndexDB transaction создана');
        const transaction = db.transaction(["friends"], "readwrite");
        const store = transaction.objectStore("friends");
        
        // Убеждаемся, что аккаунты загружены в back_store для оптимизации
        if (Object.keys(back_store.accounts_by_id).length === 0) {
          devDB('🔄 back_store.accounts_by_id пустой, загружаем аккаунты...');
          const accounts = await get_accounts();
          for (let ac of accounts) {
            back_store.accounts_by_id[ac.id] = ac;
          }
          devDB('✅ Аккаунты загружены в back_store:', Object.keys(back_store.accounts_by_id));
        }

        // Сохраняем сгенерированные ID для синхронизации
        const friendsWithIds: Array<{ item: FriendEntity; id: string }> = [];
        
        // Добавляем запись
        for (let item of new_list) {
          devDB('🔄 Обрабатываем друга:', item);
          const newId = uuidv4();
          devDB('🆔 Сгенерирован ID:', newId);
          
          // Сохраняем ID для дальнейшей синхронизации
          friendsWithIds.push({ item, id: newId });
          
          // Используем либо явно переданный myAccId, либо берем из item
          const accountId = explicitMyAccId || item.myAccId;
          devDB('🔍 Используем accountId:', accountId);
          
          // Оптимизация: сначала пробуем получить пароль из кеша back_store
          let accountPassword: string | null = null;
          
          const cachedAccount = back_store.accounts_by_id[accountId];
          if (cachedAccount && cachedAccount.pass) {
            accountPassword = cachedAccount.pass;
            devAuth('🚀 Пароль получен из back_store для аккаунта:', accountId);
          } else {
            devAuth('❌ Аккаунт не найден в back_store:', accountId);
            accountPassword = null;
          }
          
          if (!accountPassword) {
            prodError('❌ Пароль для аккаунта не найден:', accountId);
            rej(new Error(`Пароль для аккаунта ${accountId} не найден`));
            return;
          }
          
          devCrypto('🔐 Начинаем шифрование...');
          const dataToEncrypt = {
            ...item,
            id: newId,
            date_created: new Date(),
          };
          devCrypto('📝 Данные для шифрования:', dataToEncrypt);
          devCrypto('🔐 Пароль для шифрования длиной:', accountPassword.length, 'символов');
          
          try {
            devCrypto('⏰ Вызываем encrypt_curve25519_from_pass...');
            const encryptStartTime = Date.now();
            
            const newData = await encrypt_curve25519_from_pass({
              pass: accountPassword,
              message: JSON.stringify(dataToEncrypt),
            });
            
            const encryptDuration = Date.now() - encryptStartTime;
            devCrypto('✅ Шифрование завершено за', encryptDuration, 'мс');
            devCrypto('📊 Размер зашифрованных данных:', newData?.length || 'undefined');
            
            devDB('💾 Добавляем в IndexDB...');
            const storeStartTime = Date.now();
            
            const addRequest = store.add({ id: newId, data: newData });
            
            addRequest.onsuccess = function() {
              const storeDuration = Date.now() - storeStartTime;
              devDB('✅ store.add успешно завершен за', storeDuration, 'мс для ID:', newId);
            };
            
            addRequest.onerror = function(event) {
              devDB('❌ store.add ошибка для ID:', newId, 'event:', event);
            };
            
          } catch (encryptError) {
            prodError('❌ Ошибка шифрования:', encryptError);
            rej(encryptError);
            return;
          }
        }

        transaction.oncomplete = function () {
          devDB("🎉 Transaction oncomplete triggered!");
          devDB("✅ Данные добавлены успешно в IndexDB");
          
          // Добавляем друзей в back_store
          for (const { item, id } of friendsWithIds) {
            const friendData: FriendEntityFull = {
              ...item,
              id: id,
            };
            back_store.friends_by_id[id] = friendData;
          }
          
          devDB('✅ Друзья добавлены в back_store.friends_by_id');
          devDB('🎯 Вызываем res() для завершения add_friend');
          prodInfo('✅ Друзья добавлены успешно');
          res();
        };

        transaction.onerror = function (event) {
          devDB("❌ Transaction onerror triggered!");
          prodError("❌ Ошибка при добавлении данных в IndexDB:", event);
          rej(new Error(`IndexDB error: ${JSON.stringify(event)}`));
        };

        transaction.onabort = function (event) {
          devDB("❌ Transaction onabort triggered!");
          prodError("❌ Transaction была прервана:", event);
          rej(new Error(`IndexDB transaction aborted: ${JSON.stringify(event)}`));
        };
      } catch (error) {
        prodError('❌ Критическая ошибка в add_friend:', error);
        rej(error);
      }
    });
  })
}
