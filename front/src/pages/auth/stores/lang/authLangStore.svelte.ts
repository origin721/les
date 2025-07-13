import { debugLog } from "../../../../core/debug/logger";
import type { LANGS_KEYS } from "../../../../stores/lang_store";

export const authLangStore = (() => {
  let config = $state({});

  return ({
    get config() {
      return config;
    },
    async setConfig(newLang: keyof typeof LANGS_KEYS) {
      try {
        config = (await import(`./viewTextByLang/${newLang}.ts`)).langViewPage
      }
      catch(err) {
        config = (await import(`./viewTextByLang/en`)).langViewPage
      }
      //debugLog({config: JSON.stringify(config, null, '  ')});
    }
  })
})();