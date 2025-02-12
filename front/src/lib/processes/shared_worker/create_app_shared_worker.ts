import { sleep, toJson } from "../../core";
import { 
  type BackMiddlewareEvent,
  type BackMiddlewareProps
} from "../../local_back/middleware";
import { shared_worker_store } from "./shared_worker_store";

export async function createAppSharedWorker() {
  const workerUrl = new URL('./process/sharedWorker.js', import.meta.url);
  console.log({workerUrl});
  await sleep(1000);
  // const worker = new WorkerModule.default();
  // Создаем общий воркер
  const sharedWorker = new SharedWorker(workerUrl, { type: 'module' });

  // Отправляем сообщение общему воркеру
  sharedWorker.port.postMessage({ message: "Hello, shared worker!" });
  const promiseResolves: PromiseResolves = {};
  shared_worker_store.set({
    sendMessage: (event: BackMiddlewareEvent) => {
      const result = new Promise(async(res, rej) => {
        promiseResolves[event.idRequest] = res;
      });
      sharedWorker.port.postMessage({ message: JSON.stringify(event) })
      return result;
    },
  });

  // Получаем ответ от общего воркера
  sharedWorker.port.onmessage = function (event) {
    console.log('Received from shared worker:', event.data);
    listener(event.data, promiseResolves);
  };


  // Открываем порт, чтобы начать взаимодействие
  sharedWorker.port.start();
}

type PromiseResolves = Record<
  string,
  (p: BackMiddlewareProps) => void
>;
async function listener(
  param: string,
  promiseResolves: PromiseResolves,
) {
  try {
    const props = toJson(param) as BackMiddlewareProps;

    if(promiseResolves[props.idRequest]) {
      promiseResolves[props.idRequest](props);
      delete promiseResolves[props.idRequest];
    }
  }
  catch(err) {
    return null;
  }
};