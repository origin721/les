import { writable } from "svelte/store";

export const gpgStore = createPpgStore();

function createPpgStore() {
    const store = writable([]);

    return {
        subscribe: store.subscribe,
    }
}

// import { get, writable } from "svelte/store";

// export const appPassStore = createAppPassStore();

// function createAppPassStore() {
//   const store = writable<Store>(getInitialStore());

//   return {
//     subscribe: store.subscribe,
//     add: (gpgItem: GpgItem) => {
//       store.update((prev) => ({
//         ...prev,
//         pgps: [...prev.pgps, gpgItem],
//       }));
//     },
//     setAuthSecret(newAuthSecret: AuthSecret) {
//       store.update((prev) => ({
//         ...prev,
//         authSecret: newAuthSecret,
//       }));
//     }
//   };
// }

// type Store = {
//   pgps: GpgItem[];
//   authSecret: AuthSecret;
// };

// type AuthSecret = null | {
//   name: string;
//   pass: string;
// };

// type GpgItem = {
//   keyPriv: string;
//   keyPub: string;
//   pass: string;
// };

// function getInitialStore() {
//   return {
//     pgps: [],
//     authSecret: null,
//   };
// }
