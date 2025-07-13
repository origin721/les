export const lang_store = (() => {
  let state = $state();

  return {
    get state() {
      return state;
    },
    set state(newValue: typeof state) {
      state = newValue;
    }
  }
})();