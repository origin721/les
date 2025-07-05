import { encrypt_curve25519_from_pass } from "../../../../core/crypt";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import { back_store } from "../../../../local_back/back_store/back_store";
import { prodError, prodInfo, devDB, devCrypto, devAuth } from "../../../../core/debug/logger";
import { get_accounts } from "../accounts/get_accounts";
import type { RoomEntityFull } from "./add_room";
import { rooms_store_utils } from "../../../../local_back/back_store";

export function put_rooms(
  update_list: RoomEntityFull[],
  explicitMyAccId?: string // Явно переданный ID аккаунта
): Promise<void> {
  devDB('🔄 Обновление комнат начато, количество:', update_list.length, 'explicitMyAccId:', explicitMyAccId);
  devDB('🔍 back_store.accounts_by_id:', back_store.accounts_by_id);
  
  return new Promise((mRes, mRej) => {
    indexdb_wrapper((db) => {
      return new Promise(async (res, rej) => {
        try {
          devDB('📦 IndexDB transaction создана');
          const transaction = db.transaction(["rooms"], "readwrite");
          const store = transaction.objectStore("rooms");
          
          // Убеждаемся, что аккаунты загружены в back_store для оптимизации
          if (Object.keys(back_store.accounts_by_id).length === 0) {
            devDB('🔄 back_store.accounts_by_id пустой, загружаем аккаунты...');
            const accounts = await get_accounts();
            for (let ac of accounts) {
              back_store.accounts_by_id[ac.id] = ac;
            }
            devDB('✅ Аккаунты загружены в back_store:', Object.keys(back_store.accounts_by_id));
          }

          // Обновляем записи
          for (let item of update_list) {
            devDB('🔄 Обрабатываем комнату для обновления:', item);
            
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
              mRej(new Error(`Пароль для аккаунта ${accountId} не найден`));
              rej(new Error(`Пароль для аккаунта ${accountId} не найден`));
              return;
            }
            
            devCrypto('🔐 Начинаем шифрование...');
            const dataToEncrypt = {
              ...item,
              date_updated: new Date(),
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
              
              devDB('💾 Обновляем в IndexDB...');
              const storeStartTime = Date.now();
              
              const putRequest = store.put({ id: item.id, data: newData });
              
              putRequest.onsuccess = function() {
                const storeDuration = Date.now() - storeStartTime;
                devDB('✅ store.put успешно завершен за', storeDuration, 'мс для ID:', item.id);
              };
              
              putRequest.onerror = function(event) {
                devDB('❌ store.put ошибка для ID:', item.id, 'event:', event);
              };
              
            } catch (encryptError) {
              prodError('❌ Ошибка шифрования:', encryptError);
              mRej(encryptError);
              rej(encryptError);
              return;
            }
          }

          transaction.oncomplete = function () {
            devDB("🎉 Transaction oncomplete triggered!");
            devDB("✅ Данные обновлены успешно в IndexDB");
            
            // Обновляем комнаты в back_store через сервис
            rooms_store_utils.put(update_list);
            
            devDB('✅ Комнаты обновлены в back_store через сервис');
            devDB('🎯 Вызываем res() для завершения put_rooms');
            prodInfo('✅ Комнаты обновлены успешно');
            mRes();
            res();
          };

          transaction.onerror = function (event) {
            devDB("❌ Transaction onerror triggered!");
            prodError("❌ Ошибка при обновлении данных в IndexDB:", event);
            const error = new Error(`IndexDB error: ${JSON.stringify(event)}`);
            mRej(error);
            rej(error);
          };

          transaction.onabort = function (event) {
            devDB("❌ Transaction onabort triggered!");
            prodError("❌ Transaction была прервана:", event);
            const error = new Error(`IndexDB transaction aborted: ${JSON.stringify(event)}`);
            mRej(error);
            rej(error);
          };
        } catch (error) {
          prodError('❌ Критическая ошибка в put_rooms:', error);
          mRej(error);
          rej(error);
        }
      });
    });
  });
}
