import { get, writable } from "svelte/store";
import type { NewAccount } from "../../core/local-storage/app-local-storage";
import { type Account } from "../../core/indexdb/accounts/get_accounts";
import { shared_worker_store } from "../../processes";
import { PATHS } from "../../local_back";

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
      await shared_worker_store.fetch({
        path: PATHS.ADD_ACCOUNTS,
        body: {
          list: [newAcc],
        }
      });
      const newList = await shared_worker_store.fetch({
        path: PATHS.GET_ACCOUNTS,
        body: {
          pass: newAcc.pass
        }
      });

      store.update(prev => ({
        byId: {
          ...prev.byId,
          ...authListToRecordById(newList),
        }
      }));
    },
    async onLogin(pass: string) {
      const newList = await shared_worker_store.fetch({
        path: PATHS.GET_ACCOUNTS,
        body: {
          pass: pass
        }
      });
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
     // await delete_accounts([id]);
      await shared_worker_store.fetch({
        path: PATHS.DELETE_ACCOUNTS,
        body: {
          ids: [id]
        }
      });

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
