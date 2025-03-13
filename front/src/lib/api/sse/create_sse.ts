import { jsonParse, PromiseWithResolvers } from "../../core";
import { create_safe_result } from "../../core/validation/create_safe_result";
import { generate_keys_curve25519, generate_keys_ed25519 } from "../../crypt";
import { PATHS_POST } from "../http/constants";
import { event_post, type EventServerSendByPubKey, type SecureParam } from "../http/event_post";

type CreateMyEventsProps = {
  url: string;
}


const CONNECTED_STATUSES = {
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  AWAITING: 'AWAITING',
}

type ConnectedStatuses = typeof CONNECTED_STATUSES;
type MessageListener = (data: unknown) => void;

// TODO: подумать все ли аргументы реально нужны
type SseConnectResult = {
  /**
   * Функция для подключения к серверу
   */
  connect: () => Promise<unknown>;
  /**
   * Для получения статуса подключен ли к серверу
   */
  getStatus: () => ConnectedStatuses[keyof ConnectedStatuses];
  /**
   * Для закрытия сокета и отписки на сервере
   */
  disconnect: () => Promise<unknown>;
  /**
   * Вопрос дисконет отписывает ли? или после удаления сокета можно автоматизировать отписку
   */
  addListenerMessage: (l: MessageListener) => void;
  /**
   * Для удаления слушателя сообщений
   */
  removeListenerMessage: (l: MessageListener) => void;
  /**
   * Для отправки сообщения по публичному ключу
   */
  sendByPubKey: (p: EventServerSendByPubKey['body']) => Promise<unknown>;
}

export const create_sse = (
  p: CreateMyEventsProps,
  secureParam: SecureParam,
) => {
  let _connectedStatus = CONNECTED_STATUSES.DISCONNECTED;

  // TODO: подумать как инициализировать лучше
  const result: SseConnectResult = {
    connect: async () => { },
    getStatus: () => _connectedStatus,
    disconnect: async () => { },
    addListenerMessage: () => { },
    removeListenerMessage: () => { },
    sendByPubKey: async () => { },
  }

  result.connect = async() => {
    //console.log('DebugConnected sse');
    if([CONNECTED_STATUSES.AWAITING].includes(_connectedStatus)) throw new Error('Статус: ' + _connectedStatus + '. Подключаться можно только при статусе: ' + CONNECTED_STATUSES.DISCONNECTED);

    _connectedStatus = CONNECTED_STATUSES.AWAITING;

    // Создаем новый объект EventSource и указываем URL для подключения
    const eventSource = new EventSource(p.url);

    const deferred = PromiseWithResolvers();

    // Обрабатываем события, когда сервер отправляет данные
    eventSource.onmessage = function (event) {
      const eventData = event.data;
      // console.log('sse: ', { eventData });
      // main_middleware(eventData);
      // console.log({list_connected});
      const responseData = jsonParse(eventData);

      console.log({sseMess: responseData});

      (async () => {

        if (!responseData?.connection_id) return;

        try {
          await event_post(
            {
              path: PATHS_POST.server_event_registration,
              body: {
                connection_id: responseData.connection_id,
              }
            },
            secureParam,
          );
        }
        catch (err) {
          _connectedStatus = CONNECTED_STATUSES.DISCONNECTED
          // TODO: написать ошибку с url
          deferred.reject(err);
          return;
          //throw err;
        }

        result.sendByPubKey = (p) => {
          return event_post(
            {
              path: PATHS_POST.send_by_pub_key,
              body: p,
            },
            secureParam,
          )
        }

        _connectedStatus = CONNECTED_STATUSES.CONNECTED;

        deferred.resolve(null);

       //await event_post(
       //  {
       //    path: PATHS_POST.send_by_pub_key,
       //    body: {
       //      pub_key_client: c25519.publicKey,
       //      message: 'hi))'
       //    }
       //  },
       //  {
       //    pub_key_curve25519_client: c25519.publicKey,
       //    priv_key_curve25519_client: c25519.privateKey,
       //    pub_key_ed25519_client: e25519.publicKey,
       //    pub_key_curve25519_server: 'fcd046db8e4dd8248259c12db085dee9e5b8854c9e49894e3d4f48cf1853c16a',
       //  }
       //)
      })();
    };

    // Обрабатываем ошибки
    eventSource.onerror = function (event) {
      console.clear();
      // TODO: доработать в интерфейс
      // console.error("EventSource failed:", event, get(events_store));
      // events_store.delete_registration_by_id()
      console.log({ event }, 'Возможно сервер недоступен');

      // TODO: в случае если сервер недоступен нужно брать обрабатывать

      // if (list_connected.length === 1) {
      //   const _p = list_connected.pop();
      //   if (_p) {
      //     events_store.delete_registration_by_id(_p);
      //     console.log('deleted: ', _p);
      //   }
      // }
    };

    return deferred.promise;
  }

  return result;
};