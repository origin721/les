//import { AES } from "../../../core/crypt";
import { createEd25519PeerId } from "@libp2p/peer-id-factory";
import { encrypt_curve25519_from_pass } from "../../core/crypt";
import { gen_pass } from "../../core/random/gen_pass";
import { uuidv4 } from "../../core/uuid";
import { indexdb_wrapper } from "../indexdb_wrapper";

export type HttpServerParam = {
  url: string;
  isActive: boolean;
  id: string;
}

export type AccountEntity = {
  namePub: string;
  pass: string;
  httpServers: HttpServerParam[];
}

export function add_accounts(new_list: AccountEntity[]) {
  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {
      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");
      // Добавляем запись
      for (let item of new_list) {
        const newId = uuidv4();
        const peerId = await createEd25519PeerId();
        
        const newData = await encrypt_curve25519_from_pass({
          pass: item.pass,
          message: JSON.stringify({
            ...item,
            id: newId,
            _pass: gen_pass(),
            _libp2p_peerId: peerId.toString(),
            date_created: new Date(),
          }),
        });
        store.add({ id: newId, data: newData });
      }

      transaction.oncomplete = function () {
        console.log("Данные добавлены успешно");
        res();
      };

      transaction.onerror = function (event) {
        console.error("Ошибка при добавлении данных:", event.target.errorCode);
        rej();
      };
    });
  })
}