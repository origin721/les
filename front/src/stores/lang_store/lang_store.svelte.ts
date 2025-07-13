import { KEYS } from "../../core/local-storage/constants";
import { LANGS_KEYS } from "./constants";

export const lang_store = (() => {
  let state = $state<''|keyof typeof LANGS_KEYS>(
    localStorage.getItem(KEYS.LANG) as any
    || ''
  );

  return {
    get state() {
      return state;
    },
    set state(newValue: typeof state) {
      localStorage.setItem(KEYS.LANG, newValue);
      state = newValue;
    }
  }
})();