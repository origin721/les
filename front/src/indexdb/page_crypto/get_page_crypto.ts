import { decrypt_curve25519_from_pass } from "../../core/crypt";
import { back_store } from "../../local_back/back_store";
import { indexdb_wrapper } from "../indexdb_wrapper";

export type PageCryptoEntity = {
  account_id: string;
  curve25519_pub_key: string;
  curve25519_priv_key: string;
};

export function get_page_crypto(
): Promise<PageCryptoEntity[]> {
  return new Promise((mRes, rej) => {
    indexdb_wrapper((db) => {
      return new Promise((res, rej) => {
        const transaction = db.transaction(["page_crypto"], "readwrite");
        const store = transaction.objectStore("page_crypto");

        const targetId = 5; // Искомый id
        let found = true;

        const request = store.openCursor();
        const result: PageCryptoEntity[] = []
        request.onsuccess = async function (event) {
          const cursor = event.target.result;
          if (cursor) {
           //if (!found && cursor.value.id === targetId) {
           //  found = true; // Нашли нужный id
           //}
            if (found) {
              try {
                const passwords = new Set<string>();
                for(let ac of Object.values(back_store.accounts_by_id)) {
                  passwords.add(ac.pass);
                }
                for (let pass of passwords) {
                  const _item = await decrypt_curve25519_from_pass({
                      pass,
                      cipherText: cursor.value.data,
                  });
                  const decrData = !_item 
                    ? null
                    : JSON.parse(_item);
                  if (decrData)
                    result.push(decrData);
                }

              }
              catch(err) {}
              //console.log("Обработка записи:", cursor.value);
            }
            cursor.continue(); // Продолжаем обход
          } else {
            mRes(result);
            //console.log("Обработка завершена.");
            res();
          }
        };

      });
    })

  });
}
