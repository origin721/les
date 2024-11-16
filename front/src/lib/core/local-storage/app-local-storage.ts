import { AES } from "../../crypt";
import { uuidv4 } from "../uuid";
import { KEYS } from "./constants";

/**
 * @type {Object}
 * @prop onLogin
 * Получает данные из localStore
 * Проверяет всех пользователей с этим паролем
 * Если что то смог дешифровать тем же паролем то тоже добавит в ответ
 * @prop getSecret
 * Получает все доступные пароли в иходном(зашифрованном) виде
 */
export const appLocalStorage = {
  getSecret() {
    try {
      const authList = JSON.parse(localStorage.getItem(KEYS.SECRET) || "");

      if (Array.isArray(authList)) return authList;
    } catch (err) {
      return [];
    }
    return [];
  },
  /**
   * См. родительскую доку
   */
  onLogin(pass: string): LoginItem[] {
    try {
      const authList = JSON.parse(localStorage.getItem(KEYS.SECRET) || "");
      if (!Array.isArray(authList)) return [];

      return authList.reduce((acc, encrItem) => {
        try {
          const secret = AES.decrypt(encrItem, pass);
          if (secret)
            acc.push({
              origin: encrItem,
              decr: JSON.parse(secret),
            });
        } catch(err) {
        }

        return acc;
      }, []);
    } catch (err) {
      console.error(err);
      return [];
    }
  },
  addSecret(item: NewAccount) {
    const newItem = AES.encrypt(JSON.stringify({
      ...item,
      id: uuidv4(),
    }), item.pass);
    const newSecrets = appLocalStorage.getSecret();
    newSecrets.push(newItem);
    localStorage.setItem(KEYS.SECRET, JSON.stringify(newSecrets));
  },
  onDeleteSecret(origin: string) {
    const secrets = appLocalStorage.getSecret().filter((el) => el !== origin);
    localStorage.setItem(KEYS.SECRET, JSON.stringify(secrets));
  },
} as const;

export type NewAccount = {
  login: string;
  pass: string;
};

export type LoginItem = {
  /**
   * Используется для удаления
   */
  origin: string;
  decr: {
    pass: string;
    login: string;
    id: string;
  };
}