//import { AES } from "../../../core/crypt";
import { encrypt_curve25519_from_pass } from "../../core/crypt";
import { gen_pass } from "../../core/random/gen_pass";
import { uuidv4 } from "../../core/uuid";
import { indexdb_wrapper } from "../indexdb_wrapper";
import { privateKeyToString, recommendedGenerateKeyPair } from "../../libs/libp2p";
import { prodError, prodInfo } from "../../core/debug/logger";

export type HttpServerParam = {
  url: string;
  isActive: boolean;
  id: string;
}

export type AccountEntity = {
  namePub: string;
  pass: string;
  httpServers: HttpServerParam[];
  friendsByIds?: string[];  // Опциональное для обратной совместимости
}

export function add_accounts(new_list: AccountEntity[]) {
  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {
      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");
      // Добавляем запись
      for (let item of new_list) {
        const newId = uuidv4();
        const libp2p_keyPair = await recommendedGenerateKeyPair();
        
        const newData = await encrypt_curve25519_from_pass({
          pass: item.pass,
          message: JSON.stringify({
            ...item,
            id: newId,
            _pass: gen_pass(),
            _libp2p_keyPair: privateKeyToString(libp2p_keyPair),
            date_created: new Date(),
            friendsByIds: item.friendsByIds || [],  // Инициализируем пустым массивом
          }),
        });
        store.add({ id: newId, data: newData });
      }

      transaction.oncomplete = function () {
        prodInfo("Данные добавлены успешно");
        res();
      };

      transaction.onerror = function (event) {
        prodError("Ошибка при добавлении данных:", event);
        rej(new Error("Ошибка при добавлении данных в IndexedDB"));
      };
    });
  })
}
