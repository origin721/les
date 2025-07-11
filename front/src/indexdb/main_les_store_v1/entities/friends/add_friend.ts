//import { AES } from "../../../core/crypt";
import { encrypt_curve25519_from_pass } from "../../../../core/crypt";
import type { FriendEntity, FriendEntityFull } from "./types";
import { gen_pass } from "../../../../core/random/gen_pass";
import { uuidv4 } from "../../../../core/uuid";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import {
  privateKeyToString,
  recommendedGenerateKeyPair,
} from "../../../../libs/libp2p";
import { back_store } from "../../../../local_back/back_store/back_store";
import { FRIENDS_VERSION } from "./constants";
import { prodInfo, prodError, devDB } from "../../../../core/debug/logger";

// 1. нужно получать myId из аргумента
export function add_friend(
  new_list: FriendEntity[],
  myAccId?: string,
): Promise<FriendEntityFull[]> {
  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {
      try {
        prodInfo(
          `🔄 add_friend начинается: добавляем ${new_list.length} друзей, myAccId=${myAccId}`,
        );
        devDB("📝 Данные для добавления:", new_list);
        devDB(
          "📊 Доступные аккаунты в back_store:",
          Object.keys(back_store.accounts_by_id),
        );

        const transaction = db.transaction(["friends"], "readwrite");
        const store = transaction.objectStore("friends");

        // Массив для сохранения добавленных друзей
        const addedFriends: FriendEntityFull[] = [];

        // Добавляем запись
        for (let item of new_list) {
          const newId = uuidv4();
          //const libp2p_keyPair = await recommendedGenerateKeyPair();

          // Используем переданный myAccId или тот что в элементе
          const effectiveMyAccId = myAccId || item.myAccId;
          devDB(
            `🔍 Обрабатываем друга: ${item.namePub}, effectiveMyAccId: ${effectiveMyAccId}`,
          );

          // Проверяем существование аккаунта
          const acc = back_store.accounts_by_id[effectiveMyAccId];
          if (!acc) {
            const error = `❌ Аккаунт ${effectiveMyAccId} не найден в back_store`;
            prodError(error);
            prodError(
              "Доступные аккаунты:",
              Object.keys(back_store.accounts_by_id),
            );
            throw new Error(error);
          }

          if (!acc.pass) {
            const error = `❌ У аккаунта ${effectiveMyAccId} нет пароля`;
            prodError(error);
            throw new Error(error);
          }

          devDB(
            `🔐 Шифруем данные друга с паролем аккаунта ${effectiveMyAccId}`,
          );

          const friendData = {
            ...item,
            id: newId,
            myAccId: effectiveMyAccId, // Убедиться что правильный myAccId сохраняется
            //_pass: gen_pass(),
            //_libp2p_keyPair: privateKeyToString(libp2p_keyPair),
            date_created: new Date(),
            date_updated: new Date(),
            version: FRIENDS_VERSION,
          };

          // Сохраняем для возврата и back_store
          addedFriends.push(friendData);

          const newData = await encrypt_curve25519_from_pass({
            pass: acc.pass,
            message: JSON.stringify(friendData),
          });

          store.add({ id: newId, data: newData });
          prodInfo(`✅ Друг ${item.namePub} добавлен с ID: ${newId}`);
        }

        transaction.oncomplete = function () {
          prodInfo("✅ add_friend: Все данные добавлены успешно в IndexedDB");

          // Обновляем back_store добавленными друзьями
          for (const friendData of addedFriends) {
            back_store.friends_by_id[friendData.id] = friendData;
            devDB(
              `📊 Друг ${friendData.namePub} добавлен в back_store с ID: ${friendData.id}`,
            );
          }

          prodInfo(
            `✅ add_friend: ${addedFriends.length} друзей синхронизированы с back_store`,
          );
          res(addedFriends); // Возвращаем добавленные данные
        };

        transaction.onerror = function (event) {
          const errorCode = (event.target as any)?.errorCode;
          const error = `❌ add_friend: Ошибка транзакции IndexedDB: ${errorCode}`;
          prodError(error);
          rej(new Error(error));
        };
      } catch (error) {
        prodError("❌ add_friend: Ошибка во время выполнения:", error);
        rej(error);
      }
    });
  });
}
