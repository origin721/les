import { AES } from "../../../crypt";
import { indexdb_wrapper } from "../indexdb_wrapper";

export type Account = {
  login: string;
  pass: string;
  id: string;
  date_created: Date;
};

export function get_accounts(
  pass: string
): Promise<Account[]> {
  return new Promise((mRes, rej) => {
    indexdb_wrapper((db) => {
      return new Promise((res, rej) => {
        const transaction = db.transaction(["accounts"], "readwrite");
        const store = transaction.objectStore("accounts");

        const targetId = 5; // Искомый id
        let found = true;

        const request = store.openCursor();
        const result: Account[] = []
        request.onsuccess = function (event) {
          const cursor = event.target.result;
          if (cursor) {
            if (!found && cursor.value.id === targetId) {
              found = true; // Нашли нужный id
            }
            if (found) {
              try {

                const decrData = JSON.parse(AES.decrypt(cursor.value.data, pass));
                if (decrData)
                  result.push(decrData);
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