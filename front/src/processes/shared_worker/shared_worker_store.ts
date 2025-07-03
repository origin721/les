import { writable } from "svelte/store";
import type { BackMiddlewareEvent, BackMiddlewarePayload, BackMiddlewareProps, ResultByPath } from "../../local_back/middleware";
import { create_counter_generator } from "../../core/create_counter_generator";
import { EVENT_TYPES } from "../../local_back/constant";

const workerGeneratorIds = create_counter_generator();

export const shared_worker_store = create_shared_worker_store();

function create_shared_worker_store() {
  const store = writable<Store>();

  const requestBefore: _SendProps[] = [];
  const result = {
    subscribe: store.subscribe,
    set: store.set,
    fetch: (
      params: FetchParams
    ): any => {
      console.log('🔄 shared_worker_store.fetch ВЫЗОВ с параметрами:', params);
      console.log('🔄 shared_worker_store.fetch состояние store инициализирован:', !!store);
      console.log('🔄 shared_worker_store.fetch requestBefore.length:', requestBefore.length);
      
      return new Promise((res, rej) => {
        // Добавляем timeout для защиты от зависания
        const timeout = setTimeout(() => {
          console.log('⏰ shared_worker_store.fetch TIMEOUT для запроса:', params);
          rej(new Error('SharedWorker timeout: операция превысила 15 секунд'));
        }, 15000);

        const idRequest = workerGeneratorIds();
        console.log('🔄 shared_worker_store.fetch сгенерирован idRequest:', idRequest);
        
        requestBefore.push({
          // @ts-ignore
          data: {
            ...params,
            idRequest,
            type: EVENT_TYPES.FETCH,
          },
          res: (result: any) => {
            console.log('✅ shared_worker_store.fetch получен ответ для idRequest:', idRequest, 'результат:', result);
            clearTimeout(timeout);
            res(result);
          },
        });
        console.log('🔄 shared_worker_store.fetch добавлен в requestBefore, общая длина:', requestBefore.length);
      });
    }
  }

  store.subscribe(async (newStore) => {
    if(!newStore) return;
    result.fetch = (
      p: FetchParams
    ): ResultByPath[typeof p['path']] => {
      return newStore.sendMessage({
        payload: p,
        idRequest: workerGeneratorIds(),
        type: EVENT_TYPES.FETCH,
      }).then(v => v.payload);
    };
    for (
      let _item = requestBefore.pop();
      _item;
      _item = requestBefore.pop()
    ) {
      const item = _item;
      // @ts-ignore
      result.fetch(item.data)
        .then((param: any) => {
          item.res(param as SendProps)
          //requestBefore[item.idRequest]
        });
    }
  });

  return result;
}

type FetchParams = BackMiddlewarePayload;
type _SendProps = {
  data: SendProps;
  res: (p: SendProps) => void;
}
type SendProps = BackMiddlewareEvent;
type Store = {
  sendMessage: (p: SendProps) => Promise<any>;
}
