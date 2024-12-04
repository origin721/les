import { get, writable } from "svelte/store";
import { appLocalStorage } from "../../core";
import type { NewAccount } from "../../core/local-storage/app-local-storage";
import { add_accounts } from "../../core/indexdb/accounts/add_accounts";
import { get_accounts, type Account } from "../../core/indexdb/accounts/get_accounts";
import { delete_accounts } from "../../core/indexdb/accounts/delete_accounts";

/**
 * @type {Object}
 * @prop add 
 * добавляет в localStore + в appAuthStore
 * @prop onLogin
 * Проходит все и получает доступные по паролю в localStorage
 * @prop onDeleteSecret
 * Удаляет по зашифрованному имени как и хранится
 */
export const appAuthStore = createAppAuthStore();

type AppAuthStore = {
  byId: Record<string, Account>;
}

function authListToRecordById(list: Account[]) {
  return Object.fromEntries(
    list.map(el => [el.id, el])
  )
}

function createAppAuthStore() {
  const store = writable(getInitialStore());

  const result = {
    subscribe: store.subscribe,
    add: async(newAcc: NewAccount) => {
     //appLocalStorage.addSecret(newAcc);
     //const newList = appLocalStorage.onLogin(newAcc.pass);
      await add_accounts([newAcc]);
      const newList = await get_accounts(newAcc.pass);

      store.update(prev => ({
        byId: {
          ...prev.byId,
          ...authListToRecordById(newList),
        }
      }));
    },
    async onLogin(pass: string) {
      const newList = await get_accounts(pass);
      store.update((prev) => ({
        byId: {
          ...prev.byId,
          ...authListToRecordById(newList),
        }
      }));
    },
    async onDeleteSecret(id: string) {
      // TODO: доделать удаление
      // appLocalStorage.onDeleteSecret(storeData.byId[id].origin);
      await delete_accounts([id]);

      store.update(prev => {
        const newData = {
          ...prev,
          byId: {...prev.byId}
        }
        delete newData.byId[id];

        return newData;
      });
    },
    //getById
  };

  return result;
}

function getInitialStore(): AppAuthStore {
  return {
    byId: {},
  };
}
