import { writable } from "svelte/store";
import type {
  BackMiddlewareEvent,
  BackMiddlewarePayload,
  BackMiddlewareProps,
  ResultByPath,
} from "../../local_back/middleware";
import { create_counter_generator } from "../../core/create_counter_generator";
import { EVENT_TYPES } from "../../local_back/constant";
import { devLog, prodError } from "../../core/debug/logger";
import { uuidv4 } from "../../core/uuid";

const workerGeneratorIds = create_counter_generator();

export const shared_worker_store = create_shared_worker_store();

function create_shared_worker_store() {
  const store = writable<Store>();
  let currentStore: Store | null = null;
  const pendingRequests: Map<
    string,
    { resolve: Function; reject: Function; timeout: NodeJS.Timeout }
  > = new Map();
  const pendingOperations: Array<{
    params: FetchParams;
    resolve: Function;
    reject: Function;
  }> = [];

  const result = {
    subscribe: store.subscribe,
    set: (value: Store) => {
      devLog("shared_worker_store.set: инициализация store");
      currentStore = value;
      store.set(value);

      // Обрабатываем отложенные операции
      processPendingOperations();
    },
    fetch: async (params: FetchParams): Promise<any> => {
      devLog("shared_worker_store.fetch ВЫЗОВ с параметрами:", params);

      return new Promise((resolve, reject) => {
        if (!currentStore) {
          devLog(
            "shared_worker_store.fetch: store не инициализирован, добавляем в очередь",
          );
          pendingOperations.push({ params, resolve, reject });
          return;
        }

        performFetch(params, resolve, reject);
      });
    },
    subscribeToWorker: (params: SubscribeParams): (() => void) => {
      devLog(
        "shared_worker_store.subscribeToWorker ВЫЗОВ с параметрами:",
        params,
      );

      const idRequest = uuidv4();
      devLog(
        "shared_worker_store.subscribeToWorker сгенерирован idRequest:",
        idRequest,
      );

      if (!currentStore) {
        prodError("SharedWorker не инициализирован для подписки");
        return () => {};
      }

      // Регистрируем callback
      currentStore.onSubscriptionMessage =
        currentStore.onSubscriptionMessage || {};
      currentStore.onSubscriptionMessage[idRequest] = params.callback;

      // Отправляем подписку
      currentStore
        .sendMessage({
          payload: params.payload,
          idRequest,
          type: EVENT_TYPES.SUBSCRIBE,
        })
        .catch((error) => {
          devLog(
            "shared_worker_store.subscribeToWorker ошибка отправки подписки:",
            error,
          );
        });

      // Возвращаем функцию отписки
      return () => {
        devLog(
          "shared_worker_store.subscribeToWorker ОТПИСКА для idRequest:",
          idRequest,
        );
        if (currentStore?.onSubscriptionMessage) {
          // TOOD: доделать сигнал завершения
          //currentStore.onSubscriptionMessage();
          delete currentStore.onSubscriptionMessage[idRequest];
        }
      };
    },
  };

  function performFetch(
    params: FetchParams,
    resolve: Function,
    reject: Function,
  ) {
    if (!currentStore) {
      reject(new Error("SharedWorker не инициализирован"));
      return;
    }

    const idRequest = workerGeneratorIds().toString();
    devLog(
      "shared_worker_store.performFetch сгенерирован idRequest:",
      idRequest,
    );

    // Добавляем timeout
    const timeout = setTimeout(() => {
      const request = pendingRequests.get(idRequest);
      if (request) {
        pendingRequests.delete(idRequest);
        prodError(
          "shared_worker_store.performFetch TIMEOUT для запроса:",
          params,
        );
        reject(new Error("SharedWorker timeout: операция превысила 5 минут"));
      }
    }, 300000);

    // Сохраняем resolve/reject для этого запроса
    pendingRequests.set(idRequest, { resolve, reject, timeout });

    // Отправляем запрос
    currentStore
      .sendMessage({
        payload: params,
        idRequest,
        type: EVENT_TYPES.FETCH,
      })
      .then((response) => {
        const request = pendingRequests.get(idRequest);
        if (request) {
          clearTimeout(request.timeout);
          pendingRequests.delete(idRequest);
          devLog(
            "shared_worker_store.performFetch успешный ответ для idRequest:",
            idRequest,
          );
          resolve(response.payload);
        }
      })
      .catch((error) => {
        const request = pendingRequests.get(idRequest);
        if (request) {
          clearTimeout(request.timeout);
          pendingRequests.delete(idRequest);
          prodError(
            "shared_worker_store.performFetch ошибка для idRequest:",
            idRequest,
            error,
          );
          reject(error);
        }
      });
  }

  function processPendingOperations() {
    devLog(
      "shared_worker_store.processPendingOperations: обрабатываем",
      pendingOperations.length,
      "отложенных операций",
    );

    while (pendingOperations.length > 0) {
      const operation = pendingOperations.shift();
      if (operation) {
        performFetch(operation.params, operation.resolve, operation.reject);
      }
    }
  }

  return result;
}

type FetchParams = BackMiddlewarePayload;
type SubscribeParams = {
  payload: BackMiddlewarePayload;
  callback: (data: any) => void;
};
type Store = {
  sendMessage: (p: SendProps) => Promise<any>;
  onSubscriptionMessage?: { [idRequest: string]: (data: any) => void };
};
type SendProps =
  | BackMiddlewareEvent
  | {
      idRequest: string | number;
      type: (typeof EVENT_TYPES)["SUBSCRIBE"];
      payload: BackMiddlewarePayload;
    };
