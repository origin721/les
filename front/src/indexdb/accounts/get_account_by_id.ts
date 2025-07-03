//import { AES } from "../../../crypt";
import { decrypt_curve25519_from_pass } from "../../core/crypt";
import { back_store } from "../../local_back/back_store";
import { indexdb_wrapper } from "../indexdb_wrapper";
import type { HttpServerParam } from "./add_accounts";
import { prodError } from "../../core/debug/logger";

export type Account = {
  namePub: string;
  // TODO: pass должен быть через нижнее подчёркивание _pass но похоже много где завязано без него, отрефачить
  pass: string;
  _libp2p_keyPair: string;
  id: string;
  httpServers: HttpServerParam[];
  date_created: Date;
  date_updated?: Date;
};

export function get_account_by_id(
  accId: string,
): Promise<Account> {
  return new Promise((mRes, rej) => {
    indexdb_wrapper((db) => {
      return new Promise((res, rej) => {
        const transaction = db.transaction(["accounts"], "readwrite");
        const store = transaction.objectStore("accounts");


        // Получаем запись по идентификатору
        const getRequest = store.get(accId);

        getRequest.onerror = function (event) {
          prodError('Ошибка при получении записи:', (event.target as any)?.error);
        };

        getRequest.onsuccess = async function (event) {
          try {
            const entity = (event.target as any)?.result;
            if (entity && back_store.accounts_by_id[accId]) {
              const decryptedData = await decrypt_curve25519_from_pass({
                pass: back_store.accounts_by_id[accId].pass,
                cipherText: entity.data,
              });
              if (decryptedData) {
                mRes(JSON.parse(decryptedData));
              } else {
                throw 'Не удалось расшифровать данные для аккаунта ' + accId;
              }
            } else {
              throw 'Сущность с таким id не найдена ' + accId;
            }

          }
          catch (err) {
            prodError(err);
            rej(err)
          }
        }

      });
    })

  });
}
