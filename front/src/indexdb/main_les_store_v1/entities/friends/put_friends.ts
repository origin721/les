import { encrypt_curve25519_from_pass } from "../../../../core/crypt";
import { back_store } from "../../../../local_back/back_store/back_store";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import type { FriendEntity } from "./add_friend";
import { prodError, prodInfo, devDB, devCrypto, devAuth } from "../../../../core/debug/logger";

export type FriendEntityPut = {
  id: string;
  namePub: string;
  myAccId: string;
  friendPubKeyLibp2p: string;
  date_updated?: Date;
}

export function put_friends(new_list: FriendEntityPut[]) {
  devDB('🔄 Обновление друзей начато, количество:', new_list.length);
  devDB('🔍 back_store.accounts_by_id:', back_store.accounts_by_id);
  
  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {
      try {
        devDB('📦 IndexDB transaction создана для PUT');
        const transaction = db.transaction(["friends"], "readwrite");
        const store = transaction.objectStore("friends");
        
        // Обновляем записи
        for (let item of new_list) {
          devDB('🔄 Обрабатываем обновление друга:', item);
          
          const acc = back_store.accounts_by_id[item.myAccId];
          devAuth('👤 Найденный аккаунт для шифрования:', acc);
          
          if (!acc) {
            prodError('❌ Аккаунт не найден в back_store для ID:', item.myAccId);
            prodError('❌ Доступные аккаунты:', Object.keys(back_store.accounts_by_id));
            rej(new Error(`Аккаунт ${item.myAccId} не найден в back_store`));
            return;
          }
          
          if (!acc.pass) {
            prodError('❌ У аккаунта нет пароля:', acc);
            rej(new Error(`У аккаунта ${item.myAccId} нет пароля`));
            return;
          }
          
          devCrypto('🔐 Начинаем шифрование для обновления...');
          const dataToEncrypt = {
            ...item,
            date_updated: new Date(),
          };
          devCrypto('📝 Данные для шифрования:', dataToEncrypt);
          
          const newData = await encrypt_curve25519_from_pass({
            pass: acc.pass,
            message: JSON.stringify(dataToEncrypt),
          });
          devCrypto('✅ Шифрование завершено');
          
          devDB('💾 Обновляем в IndexDB...');
          store.put({ id: item.id, data: newData });
        }

        transaction.oncomplete = function () {
          devDB("✅ Данные обновлены успешно в IndexDB");
          prodInfo("✅ Друзья обновлены успешно");
          res();
        };

        transaction.onerror = function (event) {
          prodError("❌ Ошибка при обновлении данных в IndexDB:", event);
          rej(new Error(`IndexDB PUT error: ${JSON.stringify(event)}`));
        };
      } catch (error) {
        prodError('❌ Критическая ошибка в put_friends:', error);
        rej(error);
      }
    });
  })
}
