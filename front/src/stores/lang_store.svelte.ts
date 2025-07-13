import { KEYS } from "../core/local-storage/constants";

export const lang_store = (() => {
  let state = $state<string>(
    localStorage.getItem(KEYS.LANG)
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