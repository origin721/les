import { get, writable } from "svelte/store";
import { appLocalStorage } from "../../core";
import type { LoginItem, NewAccount } from "../../core/local-storage/app-local-storage";

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
  byId: Record<string, LoginItem>;
}

function authListToRecordById(list: LoginItem[]) {
  return Object.fromEntries(
    list.map(el => [el.decr.id, el])
  )
}

function createAppAuthStore() {
  const store = writable(getInitialStore());

  const result = {
    subscribe: store.subscribe,
    add: (newAcc: NewAccount) => {
      appLocalStorage.addSecret(newAcc);
      const newList = appLocalStorage.onLogin(newAcc.pass);
      store.update(prev => ({
        byId: {
          ...prev.byId,
          ...authListToRecordById(newList),
        }
      }));
    },
    onLogin(pass: string) {
      store.update((prev) => ({
        byId: {
          ...prev.byId,
          ...authListToRecordById(appLocalStorage.onLogin(pass)),
        }
      }));
    },
    onDeleteSecret(id: string) {
      const storeData = get(store);
      appLocalStorage.onDeleteSecret(storeData.byId[id].origin);

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
