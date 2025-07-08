//import { AES } from "../../../core/crypt";
import { encrypt_curve25519_from_pass } from "../../../../core/crypt";
import { gen_pass } from "../../../../core/random/gen_pass";
import { uuidv4 } from "../../../../core/uuid";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import { privateKeyToString, recommendedGenerateKeyPair } from "../../../../libs/libp2p";
import { back_store } from "../../../../local_back/back_store/back_store";
import { FRIENDS_VERSION } from './constants';

export type FriendEntityFull = {
  id: string;
} & FriendEntity;

export type FriendEntity = {
  namePub: string;
  // TODO: сделать проверку что расшифрованный accId соотвествует если буду по той таблице идти
  myAccId: string;
  friendPubKeyLibp2p: string;
  version?: number; // Добавить это поле
  date_updated?: Date; // Добавить это поле
}
// 1. нужно получать myId из аргумента
export function add_friend(
  new_list: FriendEntity[],
) {
  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {
      const transaction = db.transaction(["friends"], "readwrite");
      const store = transaction.objectStore("friends");
      // Добавляем запись
      for (let item of new_list) {
        const newId = uuidv4();
        //const libp2p_keyPair = await recommendedGenerateKeyPair();

        const acc = back_store.accounts_by_id[item.myAccId];
        const newData = await encrypt_curve25519_from_pass({
          pass: acc.pass,
          message: JSON.stringify({
            ...item,
            id: newId,
            //_pass: gen_pass(),
            //_libp2p_keyPair: privateKeyToString(libp2p_keyPair),
            date_created: new Date(),
            date_updated: new Date(),
            version: FRIENDS_VERSION,
          }),
        });
        store.add({ id: newId, data: newData });
      }

      transaction.oncomplete = function () {
        console.log("Данные добавлены успешно");
        res();
      };

      transaction.onerror = function (event) {
        console.error("Ошибка при добавлении данных:", (event.target as any)?.errorCode);
        rej();
      };
    });
  })
}
