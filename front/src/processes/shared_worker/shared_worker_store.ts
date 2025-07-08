import { writable } from "svelte/store";
import type { BackMiddlewareEvent, BackMiddlewarePayload, BackMiddlewareProps, ResultByPath } from "../../local_back/middleware";
import { create_counter_generator } from "../../core/create_counter_generator";
import { EVENT_TYPES } from "../../local_back/constant";
import { devLog, prodError } from "../../core/debug/logger";

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
      devLog('shared_worker_store.fetch ВЫЗОВ с параметрами:', params);
      devLog('shared_worker_store.fetch состояние store инициализирован:', !!store);
      devLog('shared_worker_store.fetch requestBefore.length:', requestBefore.length);
      
      return new Promise((res, rej) => {
        // Добавляем timeout для защиты от зависания
        const timeout = setTimeout(() => {
          prodError('shared_worker_store.fetch TIMEOUT для запроса:', params);
          rej(new Error('SharedWorker timeout: операция превысила 5 минут'));
        }, 300000);

        const idRequest = workerGeneratorIds();
        devLog('shared_worker_store.fetch сгенерирован idRequest:', idRequest);
        
        requestBefore.push({
          // @ts-ignore
          data: {
            ...params,
            idRequest,
            type: EVENT_TYPES.FETCH,
          },
          res: (result: any) => {
            devLog('shared_worker_store.fetch получен ответ для idRequest:', idRequest, 'результат:', result);
            clearTimeout(timeout);
            res(result);
          },
        });
        devLog('shared_worker_store.fetch добавлен в requestBefore, общая длина:', requestBefore.length);
      });
    },
    subscribeToWorker: (
      params: SubscribeParams
    ): (() => void) => {
      devLog('shared_worker_store.subscribeToWorker ВЫЗОВ с параметрами:', params);
      
      const idRequest = workerGeneratorIds();
      devLog('shared_worker_store.subscribeToWorker сгенерирован idRequest:', idRequest);
      
      let storeValue: Store | undefined;
      let subscriptionSent = false;
      
      const unsubscribeFromStore = store.subscribe(value => {
        storeValue = value;
        
      // Отправляем подписку, как только store станет доступен
      if (storeValue && !subscriptionSent) {
        devLog('shared_worker_store.subscribeToWorker отправка подписки после инициализации store, idRequest:', idRequest);
        
        // Сначала регистрируем callback
        storeValue.onSubscriptionMessage = storeValue.onSubscriptionMessage || {};
        storeValue.onSubscriptionMessage[idRequest] = params.callback;
        
        // Затем отправляем подписку
        storeValue.sendMessage({
          payload: params.payload,
          idRequest,
          type: EVENT_TYPES.SUBSCRIBE,
        }).catch(error => {
          devLog('shared_worker_store.subscribeToWorker ошибка отправки подписки:', error);
        });
        
        subscriptionSent = true;
      }
      });
      
      // Возвращаем функцию отписки
      return () => {
        devLog('shared_worker_store.subscribeToWorker ОТПИСКА для idRequest:', idRequest);
        unsubscribeFromStore();
        if (storeValue?.onSubscriptionMessage) {
          delete storeValue.onSubscriptionMessage[idRequest];
        }
      };
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
type SubscribeParams = {
  payload: BackMiddlewarePayload;
  callback: (data: any) => void;
};
type _SendProps = {
  data: SendProps;
  res: (p: SendProps) => void;
}
type SendProps = BackMiddlewareEvent | {
  idRequest: string | number;
  type: typeof EVENT_TYPES['SUBSCRIBE'];
  payload: BackMiddlewarePayload;
};
type Store = {
  sendMessage: (p: SendProps) => Promise<any>;
  onSubscriptionMessage?: { [idRequest: string]: (data: any) => void };
}
