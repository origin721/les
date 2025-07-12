import { EVENT_TYPES, PATHS } from "./constant";
import { devLog, prodError } from "../core/debug/logger";
import type { BackMiddlewarePayload } from "./middleware";

type IdRequest = string | number;

export type SubscriptionMiddlewareProps = {
  type: (typeof EVENT_TYPES)["SUBSCRIBE"];
  payload: BackMiddlewarePayload;
  idRequest: IdRequest;
};

export type SubscriptionCallback = (data: any) => void;

export type SubscriptionResult = {
  subscriptionHandled: boolean;
  path: string;
  idRequest: IdRequest;
  initialData?: any;
  error?: string;
};

/**
 * Middleware для обработки подписок (SUBSCRIBE запросы)
 * @param props - параметры подписки
 * @param onSubscriptionUpdate - callback для отправки обновлений
 * @returns результат обработки подписки
 */
export async function subscriptionMiddleware(
  props: SubscriptionMiddlewareProps,
  onSubscriptionUpdate?: SubscriptionCallback,
): Promise<SubscriptionResult> {
  devLog("subscriptionMiddleware starting with props:", props);

  try {
    // Подписка на количество активных вкладок
    if (props.payload.path === PATHS.GET_ACTIVE_TABS_COUNT) {
      return await handleActiveTabsCountSubscription(props, onSubscriptionUpdate);
    }

    // Здесь можно добавить другие подписки:

    // if (props.payload.path === PATHS.SUBSCRIBE_FRIENDS) {
    //   return await handleFriendsSubscription(props, onSubscriptionUpdate);
    // }

    // if (props.payload.path === PATHS.SUBSCRIBE_MESSAGES) {
    //   return await handleMessagesSubscription(props, onSubscriptionUpdate);
    // }

    // if (props.payload.path === PATHS.SUBSCRIBE_ROOM_UPDATES) {
    //   return await handleRoomUpdatesSubscription(props, onSubscriptionUpdate);
    // }

    prodError(
      "subscriptionMiddleware: неподдерживаемая подписка:",
      props.payload.path,
    );

    return {
      subscriptionHandled: false,
      path: props.payload.path,
      idRequest: props.idRequest,
      error: `Неподдерживаемая подписка: ${props.payload.path}`,
    };
  } catch (err) {
    prodError("subscriptionMiddleware error:", err);

    return {
      subscriptionHandled: false,
      path: props.payload.path,
      idRequest: props.idRequest,
      error: err instanceof Error ? err.message : "Неизвестная ошибка",
    };
  }
}

/**
 * Обработчик подписки на количество активных вкладок
 */
async function handleActiveTabsCountSubscription(
  props: SubscriptionMiddlewareProps,
  onSubscriptionUpdate?: SubscriptionCallback,
): Promise<SubscriptionResult> {
  devLog(
    "subscriptionMiddleware: обрабатываем подписку на активные вкладки, idRequest:",
    props.idRequest,
  );

  // Для подписки на вкладки логика остается в SharedWorker
  // так как там ведется учет активных портов
  return {
    subscriptionHandled: true,
    path: props.payload.path,
    idRequest: props.idRequest,
    // initialData будет установлена в SharedWorker
  };
}

/**
 * Пример обработчика подписки на друзей (для будущего использования)
 */
// async function handleFriendsSubscription(
//   props: SubscriptionMiddlewareProps,
//   onSubscriptionUpdate?: SubscriptionCallback,
// ): Promise<SubscriptionResult> {
//   devLog(
//     "subscriptionMiddleware: обрабатываем подписку на друзей, idRequest:",
//     props.idRequest,
//   );

//   try {
//     // Получаем начальный список друзей
//     const initialFriends = await friends_service.getList();

//     // Настраиваем подписку на изменения через EventSource или WebSocket
//     // const eventSource = new EventSource('/api/friends/subscribe');
//     // eventSource.onmessage = (event) => {
//     //   const data = JSON.parse(event.data);
//     //   if (onSubscriptionUpdate) {
//     //     onSubscriptionUpdate({ friends: data.friends });
//     //   }
//     // };

//     return {
//       subscriptionHandled: true,
//       path: props.payload.path,
//       idRequest: props.idRequest,
//       initialData: { friends: initialFriends }
//     };
//   } catch (error) {
//     prodError("handleFriendsSubscription error:", error);
//     return {
//       subscriptionHandled: false,
//       path: props.payload.path,
//       idRequest: props.idRequest,
//       error: error instanceof Error ? error.message : "Ошибка подписки на друзей"
//     };
//   }
// }

/**
 * Пример обработчика подписки на сообщения (для будущего использования)
 */
// async function handleMessagesSubscription(
//   props: SubscriptionMiddlewareProps,
//   onSubscriptionUpdate?: SubscriptionCallback,
// ): Promise<SubscriptionResult> {
//   devLog(
//     "subscriptionMiddleware: обрабатываем подписку на сообщения, idRequest:",
//     props.idRequest,
//   );

//   const { roomId } = props.payload.body || {};
//   if (!roomId) {
//     return {
//       subscriptionHandled: false,
//       path: props.payload.path,
//       idRequest: props.idRequest,
//       error: "roomId обязателен для подписки на сообщения"
//     };
//   }

//   try {
//     // Получаем начальные сообщения
//     const initialMessages = await messages_service.getByRoomId(roomId);

//     // Настраиваем подписку на новые сообщения
//     // const subscription = await libp2p_service.subscribeToRoom(roomId, (message) => {
//     //   if (onSubscriptionUpdate) {
//     //     onSubscriptionUpdate({
//     //       type: 'new_message',
//     //       roomId,
//     //       message
//     //     });
//     //   }
//     // });

//     return {
//       subscriptionHandled: true,
//       path: props.payload.path,
//       idRequest: props.idRequest,
//       initialData: {
//         roomId,
//         messages: initialMessages
//       }
//     };
//   } catch (error) {
//     prodError("handleMessagesSubscription error:", error);
//     return {
//       subscriptionHandled: false,
//       path: props.payload.path,
//       idRequest: props.idRequest,
//       error: error instanceof Error ? error.message : "Ошибка подписки на сообщения"
//     };
//   }
// }
