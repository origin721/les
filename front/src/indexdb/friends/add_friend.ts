//import { AES } from "../../../core/crypt";
import { encrypt_curve25519_from_pass } from "../../core/crypt";
import { gen_pass } from "../../core/random/gen_pass";
import { uuidv4 } from "../../core/uuid";
import { indexdb_wrapper } from "../indexdb_wrapper";
import { privateKeyToString, recommendedGenerateKeyPair } from "../../libs/libp2p";
import { back_store } from "../../local_back/back_store";

export type FriendEntityFull = {
  id: string;
} & FriendEntity;

export type FriendEntity = {
  namePub: string;
  // TODO: сделать проверку что расшифрованный accId соотвествует если буду по той таблице идти
  myAccId: string;
  friendPubKeyLibp2p: string;
}
// 1. нужно получать myId из аргумента
export function add_friend(
  new_list: FriendEntity[],
) {
  console.log('🔥 add_friend начинает работу с данными:', new_list);
  console.log('🔍 back_store.accounts_by_id:', back_store.accounts_by_id);
  
  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {
      try {
        console.log('📦 IndexDB transaction создана');
        const transaction = db.transaction(["friends"], "readwrite");
        const store = transaction.objectStore("friends");
        
        // Добавляем запись
        for (let item of new_list) {
          console.log('🔄 Обрабатываем друга:', item);
          const newId = uuidv4();
          console.log('🆔 Сгенерирован ID:', newId);
          
          const acc = back_store.accounts_by_id[item.myAccId];
          console.log('👤 Найденный аккаунт:', acc);
          
          if (!acc) {
            console.error('❌ Аккаунт не найден в back_store для ID:', item.myAccId);
            console.error('❌ Доступные аккаунты:', Object.keys(back_store.accounts_by_id));
            rej(new Error(`Аккаунт ${item.myAccId} не найден в back_store`));
            return;
          }
          
          if (!acc.pass) {
            console.error('❌ У аккаунта нет пароля:', acc);
            rej(new Error(`У аккаунта ${item.myAccId} нет пароля`));
            return;
          }
          
          console.log('🔐 Начинаем шифрование...');
          const dataToEncrypt = {
            ...item,
            id: newId,
            date_created: new Date(),
          };
          console.log('📝 Данные для шифрования:', dataToEncrypt);
          
          const newData = await encrypt_curve25519_from_pass({
            pass: acc.pass,
            message: JSON.stringify(dataToEncrypt),
          });
          console.log('✅ Шифрование завершено');
          
          console.log('💾 Добавляем в IndexDB...');
          store.add({ id: newId, data: newData });
        }

        transaction.oncomplete = function () {
          console.log("✅ Данные добавлены успешно в IndexDB");
          res();
        };

        transaction.onerror = function (event) {
          console.error("❌ Ошибка при добавлении данных в IndexDB:", event);
          rej(new Error(`IndexDB error: ${JSON.stringify(event)}`));
        };
      } catch (error) {
        console.error('❌ Критическая ошибка в add_friend:', error);
        rej(error);
      }
    });
  })
}
