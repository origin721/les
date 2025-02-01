import { onMount } from "svelte";
// import {worker} from './worker/worker';
import { createAppSharedWorker } from './shared_worker/create_app_shared_worker';
import { v4 as uuidv4 } from 'uuid';
//import { create_my_events } from "./create_my_events";
import { shared_worker_store } from "./shared_worker/shared_worker_store";
import { broadcast_middleware } from "./broadcast_middleware";
import { getRandomInRange } from "../core/random/getRandomInRange";
import { generateRandomString } from "../core/random/generateRandomString";
import { gen_pass } from "../core/random/gen_pass";
import { sse_connect } from "../api/sse/create_sse";
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
  console.log('Сгенерированный текст:', response);
}

// Пример вызова
generateText('Привет, как дела?');

export const appProcessesMount = () => {

    onMount(() => {
        //console.log(uuidv4());
        createAppSharedWorker();
        //create_my_events();
        sse_connect();
    
        broadcast_middleware();

//console.log(getRandomInRange(1, 100)); // Случайное число от 1 до 100
console.log(gen_pass());
    });
    // console.log(AES.decrypt(AES.encrypt("asdf", "sdf"), "sdf"));
};