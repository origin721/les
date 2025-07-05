import { get, writable } from "svelte/store";
import { type Account } from "../../indexdb/main_les_store_v1/accounts/get_accounts";
import { shared_worker_store } from "../../processes";
import { PATHS } from "../../local_back";
import type { AccountEntity } from "../../indexdb/main_les_store_v1/accounts/add_accounts";
import type { AccountDto } from "../../local_back/middleware";

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

export type AppAuthStore = {
  byId: Record<string, AccountDto>;
}

export function authListToRecordById(list: AccountDto[]) {
  return Object.fromEntries(
    list.map(el => [el.id, el])
  )
}

function createAppAuthStore() {
  const store = writable(getInitialStore());

  const result = {
    subscribe: store.subscribe,
    _add: (newList: AccountDto[]) => {
      store.update((prev) => ({
        byId: {
          ...prev.byId,
          ...authListToRecordById(newList),
        }
      }));

    },
    add: async(newAcc: AccountEntity) => {
     //appLocalStorage.addSecret(newAcc);
     //const newList = appLocalStorage.onLogin(newAcc.pass);
      await shared_worker_store.fetch({
        path: PATHS.ADD_ACCOUNTS,
        body: {
          list: [newAcc],
        }
      });
      await shared_worker_store.fetch({
        path: PATHS.LOGIN,
        body: {
          pass: newAcc.pass
        }
      });

     //store.update(prev => ({
     //  byId: {
     //    ...prev.byId,
     //    ...authListToRecordById(newList),
     //  }
     //}));
    },
    async onLogin(pass: string) {
      const newList = await shared_worker_store.fetch({
        path: PATHS.LOGIN,
        body: {
          pass: pass
        }
      });
    },
    _onDeleteSecret(ids: string[]) {

      store.update(prev => {
        const newData = {
          ...prev,
          byId: {...prev.byId}
        }
        for(let id of ids) {
          delete newData.byId[id];
        }

        return newData;
      });
    },
    async onDeleteSecret(id: string) {
      // TODO: доделать удаление
      // appLocalStorage.onDeleteSecret(storeData.byId[id].origin);
     // await delete_accounts([id]);
      await shared_worker_store.fetch({
        path: PATHS.DELETE_ACCOUNTS,
        body: {
          ids: [id],
        }
      });
    },
    //getById
  };

  shared_worker_store.fetch({
    path: PATHS.GET_ACCOUNTS,
  });

  return result;
}

function getInitialStore(): AppAuthStore {
  return {
    byId: {},
  };
}
