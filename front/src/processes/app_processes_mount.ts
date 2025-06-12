import { onMount } from "svelte";
// import {worker} from './worker/worker';
import { createAppSharedWorker } from "./shared_worker/create_app_shared_worker";
import { v4 as uuidv4 } from "uuid";
//import { create_my_events } from "./create_my_events";
import { shared_worker_store } from "./shared_worker/shared_worker_store";
import { broadcast_middleware } from "./broadcast_middleware";
import { getRandomInRange } from "../core/random/getRandomInRange";
import { generateRandomString } from "../core/random/generateRandomString";
import { gen_pass } from "../core/random/gen_pass";
import { create_sse } from "../api/sse/create_sse";
import {
  ADMIN_KEYS,
  generate_keys_curve25519,
  generate_keys_ed25519,
} from "../core/crypt";
import { connectionLibp2p } from "../api/libp2p/createLibp2pNode";
//import { createLibp2pNode } from "../api/libp2p/createLibp2pNode";
//import { tmpTest } from "../api/libp2p/tmp";
//import { createLibp2pNode } from "../api/libp2p/createLibp2pNode";
// Есть способ через webasembly
//import { RWKV } from 'rwkv';

// Инициализируем RWKV с моделью
// const model = new RWKV({
//   modelPath: '/RWKV-4-Pile-430M-20220808-8066.pth', // Укажите путь к модели
// });

// Функция генерации текста
async function generateText(prompt) {
  const response = await model.generate(prompt, {
    maxTokens: 50, // Количество токенов для генерации
    temperature: 0.7, // "Творчество" модели
  });
  console.log("Сгенерированный текст:", response);
}

// Пример вызова
//generateText('Привет, как дела?');

export const appProcessesMount = () => {
  onMount(() => {
    //console.log(uuidv4());
    createAppSharedWorker();
    broadcast_middleware();

    //create_my_events();
    //createLibp2pNode();

    //tmpTest();
    //createLibp2pNode();
    //return;
    Promise.all([generate_keys_curve25519(), generate_keys_ed25519()]).then(
      ([c25519, e25519]) => {
        const sseCtl = create_sse(
          {
            url: "http://localhost:8000/events",
          },
          {
            pub_key_curve25519_client: c25519.publicKey,
            priv_key_curve25519_client: c25519.privateKey,
            pub_key_ed25519_client: e25519.publicKey,
            pub_key_curve25519_server: ADMIN_KEYS.PUB_KEY_CURVE25519_SERVER,
          },
        );
        sseCtl.connect().then(() => {
          sseCtl.sendByPubKey({
            pub_key_client: c25519.publicKey,
            message: "hi!dd!))))",
          });
          sseCtl.sendByPubKey({
            pub_key_client: c25519.publicKey,
            message: "hi!!))))",
          });
        });
      },
    );

    connectionLibp2p();

    //console.log(getRandomInRange(1, 100)); // Случайное число от 1 до 100
    //console.log(gen_pass());
  });
  // console.log(AES.decrypt(AES.encrypt("asdf", "sdf"), "sdf"));
};
