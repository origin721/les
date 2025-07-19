import { PATHS } from "./constant";
import { devLog, prodError } from "../core/debug/logger";
import { add_accounts } from "../indexdb/main_les_store_v1/entities/accounts/add_accounts";
import { accounts_service } from "./modules/accounts_service";
import { friends_service } from "./modules/friends_service";
import type { BackMiddlewarePayload } from "./middleware";

type IdRequest = string | number;

export type PromiseMiddlewareProps = {
  type: "FETCH";
  payload: BackMiddlewarePayload;
  /**
   * Индификатор который вернётся в ответе
   * например для shared worker что бы было понятно
   * что это ответ для этого запроса
   */
  idRequest: IdRequest;
};

/**
 * Middleware для обработки FETCH запросов (promise-based операции)
 * @param props - параметры запроса
 * @returns результат выполнения операции
 */
export async function promiseMiddleware(props: PromiseMiddlewareProps): Promise<any> {
  devLog("promiseMiddleware starting with props:", props);

  try {
    // Account handlers
    if (props.payload.path === PATHS.LOGIN) {
      return await accounts_service.onLogin(props.payload);
    }

    if (props.payload.path === PATHS.GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P) {
      return await accounts_service.getPeerIdForLibp2p(
        props.payload.body.accId,
      );
    }

    if (props.payload.path === PATHS.GET_ACCOUNTS) {
      return await accounts_service.getList();
    }

    if (props.payload.path === PATHS.DELETE_ACCOUNTS) {
      return await accounts_service.delete(props.payload.body.ids);
    }

    if (props.payload.path === PATHS.ADD_ACCOUNTS) {
      // TODO: вынести в сервис
      return await add_accounts(props.payload.body.list);
    }

    if (props.payload.path === PATHS.PUT_ACCOUNTS) {
      return await accounts_service.put(props.payload.body.list);
    }

    // Friends handlers
    if (props.payload.path === PATHS.GET_FRIENDS) {
      return await friends_service.getList();
    }

    if (props.payload.path === PATHS.ADD_FRIENDS) {
      return await friends_service.add(
        props.payload.body.list,
        props.payload.body.myAccId,
      );
    }

    if (props.payload.path === PATHS.DELETE_FRIENDS) {
      return await friends_service.delete(props.payload.body.ids);
    }

    if (props.payload.path === PATHS.GET_FRIENDS_BY_ACCOUNT_ID) {
      return await friends_service.getFriendsByAccountId(
        props.payload.body.myAccId,
      );
    }

    if (props.payload.path === PATHS.GET_FRIEND_BY_ID) {
      return await friends_service.getFriendById(props.payload.body.friendId);
    }

    if (props.payload.path === PATHS.PUT_FRIENDS) {
      return await friends_service.put(props.payload.body.list);
    }

    // Special case: GET_ACTIVE_TABS_COUNT can work as FETCH (return current count)
    if (props.payload.path === PATHS.GET_ACTIVE_TABS_COUNT) {
      // For FETCH requests, this will be handled by SharedWorker directly
      return { handledBySharedWorker: true };
    }

    prodError(
      "promiseMiddleware: неподдерживаемый путь:",
      props.payload.path,
    );
    return null;

  } catch (err) {
    prodError("promiseMiddleware error:", err);
    throw err;
  }
}
