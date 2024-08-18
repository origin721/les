import { get, writable } from "svelte/store";
import { appLocalStorage } from "../../core";

/**
 * @type {Object}
 * @prop add 
 * добавляет в localStore + в appAuthStore
 * @prop onLogin
 * Проходит все и получает доступные по паролю в localStorage
 * @prop onDeleteSecret
 * Удаляет по зашифрованному имени как и хранится
 */
export const appAuthStore = createAppPassStore();
type AppPass = {
  origin: string;
  decr: {
    pass: string;
    login: string;
  };
};

function createAppPassStore() {
  const store = writable(getInitialStore());

  const result = {
    subscribe: store.subscribe,
    add: (newAcc: AppPass) => {
      appLocalStorage.addSecret(newAcc);
      store.set(appLocalStorage.onLogin(newAcc.pass));
    },
    onLogin(pass: string) {
      store.update((prev) => [...prev, ...appLocalStorage.onLogin(pass)]);
    },
    onDeleteSecret(origin: string) {
      appLocalStorage.onDeleteSecret(origin);

      store.update(prev => prev.filter(el => el.origin !== origin));
    },
  };

  return result;
}

function getInitialStore() {
  return [] as AppPass[];
}
