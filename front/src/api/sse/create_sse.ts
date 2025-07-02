import { jsonParse, PromiseWithResolvers } from "../../core";
import { create_safe_result } from "../../core/validation/create_safe_result";
import { generate_keys_curve25519, generate_keys_ed25519 } from "../../core/crypt";
import { PATHS_POST } from "../http/constants";
import { event_post, type EventServerSendByPubKey, type SecureParam } from "../http/event_post";
import { debugLog, forceLog } from "../../core/debug/logger";

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
    debugLog('SSE: Попытка подключения к серверу');
    if([CONNECTED_STATUSES.AWAITING].includes(_connectedStatus)) throw new Error('Статус: ' + _connectedStatus + '. Подключаться можно только при статусе: ' + CONNECTED_STATUSES.DISCONNECTED);

    _connectedStatus = CONNECTED_STATUSES.AWAITING;
    forceLog('SSE: Начинаем подключение, статус:', _connectedStatus);

    // Создаем новый объект EventSource и указываем URL для подключения
    const eventSource = new EventSource(p.url);

    const deferred = PromiseWithResolvers();

    // Обрабатываем события, когда сервер отправляет данные
    eventSource.onmessage = function (event) {
      const eventData = event.data;
      debugLog('SSE: Получены данные от сервера:', eventData);
      const responseData = jsonParse(eventData);

      debugLog('SSE: Обработанные данные:', responseData);

      (async () => {

        if (!responseData?.connection_id) {
          debugLog('SSE: Нет connection_id в ответе сервера');
          return;
        }

        forceLog('SSE: Регистрация соединения с connection_id:', responseData.connection_id);

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
          forceLog('SSE: Регистрация успешно завершена');
        }
        catch (err) {
          _connectedStatus = CONNECTED_STATUSES.DISCONNECTED
          forceLog('SSE: КРИТИЧЕСКАЯ ОШИБКА регистрации:', err);
          deferred.reject(err);
          return;
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
        forceLog('SSE: Соединение установлено, статус:', _connectedStatus);

        deferred.resolve(null);
      })();
    };

    // Обрабатываем ошибки
    eventSource.onerror = function (event) {
      forceLog('SSE: КРИТИЧЕСКАЯ ОШИБКА соединения. Возможно сервер недоступен:', event);
      _connectedStatus = CONNECTED_STATUSES.DISCONNECTED;
      
      // TODO: доработать в интерфейс
      // TODO: в случае если сервер недоступен нужно обрабатывать
    };

    return deferred.promise;
  }

  return result;
};
