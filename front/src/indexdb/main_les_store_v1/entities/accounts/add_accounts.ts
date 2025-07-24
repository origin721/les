//import { AES } from "../../../core/crypt";
import { encrypt_curve25519_from_pass } from "../../../../core/crypt";
import { gen_pass } from "../../../../core/random/gen_pass";
import { uuidv4 } from "../../../../core/uuid";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import {
  privateKeyToString,
  recommendedGenerateKeyPair,
} from "../../../../libs/libp2p";
import { prodError, prodInfo } from "../../../../core/debug/logger";
import { ACCOUNTS_VERSION } from "./constants";
import type { AccountEntity, HttpServerParam } from "./types";
import { entity_service } from "../entity_service/entity_service";
import { back_store } from "../../../../local_back/back_store";
import { accounts_store_utils } from "../../../../local_back/back_store/accounts_store_utils";

export function add_accounts(new_list: AccountEntity[]) {
  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {
      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");
      const result = [];
      // Добавляем запись
      for (let item of new_list) {
        const newId = uuidv4();
        const libp2p_keyPair = await recommendedGenerateKeyPair();

        const entityForSave = {
          ...item,
          id: newId,
          _pass: gen_pass(),
          _libp2p_keyPair: privateKeyToString(libp2p_keyPair),
          date_created: new Date(),
          friendsByIds: item.friendsByIds || [], // Инициализируем пустым массивом
          roomIds: item.roomIds || [], // Инициализируем пустым массивом
          version: ACCOUNTS_VERSION, // Версия внутри зашифрованных данных
        }

        result.push(entityForSave)

        const newData = await encrypt_curve25519_from_pass({
          pass: item.pass,
          message: JSON.stringify(entityForSave),
        });
        store.add({ id: newId, data: newData });
      }

      transaction.oncomplete = function () {
        prodInfo("Данные добавлены успешно");
        res(result);
        
        accounts_store_utils.add(result);
      };

      transaction.onerror = function (event) {
        prodError("Ошибка при добавлении данных:", event);
        rej(new Error("Ошибка при добавлении данных в IndexedDB"));
      };
    });
  });
}
