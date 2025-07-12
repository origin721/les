import type {
  AccountEntity,
  AccountEntityPut,
} from "../indexdb/main_les_store_v1/entities/accounts/types";
import { EVENT_TYPES, PATHS } from "./constant";
import type { FriendEntity } from "../indexdb/main_les_store_v1/entities/friends/add_friend";
import type { FriendEntityPut } from "../indexdb/main_les_store_v1/entities/friends/put_friends";
import { devLog, prodError } from "../core/debug/logger";
import { promiseMiddleware } from "./promise_middleware";
import { subscriptionMiddleware } from "./subscription_middleware";

type IdRequest = string | number;
export type BackMiddlewareProps = {
  type: (typeof EVENT_TYPES)["FETCH"] | (typeof EVENT_TYPES)["SUBSCRIBE"];
  payload: BackMiddlewarePayload;
  /**
   * Индификатор который вернётся в ответе
   * например для shared worker что бы было понятно
   * что это ответ для этого запроса
   */
  idRequest: IdRequest;
};

export type AddAccountsPayload = {
  path: (typeof PATHS)["ADD_ACCOUNTS"];
  body: {
    list: AccountEntity[];
  };
};

export type DeleteAccountsPayload = {
  path: (typeof PATHS)["DELETE_ACCOUNTS"];
  body: {
    ids: string[];
  };
};

export type PutAccountsPayload = {
  path: (typeof PATHS)["PUT_ACCOUNTS"];
  body: {
    list: AccountEntityPut[];
  };
};

export type PutFriendsPayload = {
  path: (typeof PATHS)["PUT_FRIENDS"];
  body: {
    list: FriendEntityPut[];
  };
};

export type LoginPayload = {
  path: (typeof PATHS)["LOGIN"];
  body: {
    pass: string;
  };
};

export type GetAccountsPayload = {
  path: (typeof PATHS)["GET_ACCOUNTS"];
};

export type GetPeerIdByAccIdForLibp2pPayload = {
  path: (typeof PATHS)["GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P"];
  body: {
    accId: string;
  };
};

export type AddFriendsPayload = {
  path: (typeof PATHS)["ADD_FRIENDS"];
  body: {
    list: FriendEntity[];
    myAccId?: string; // Опциональный параметр для нового API
  };
};

export type DeleteFriendsPayload = {
  path: (typeof PATHS)["DELETE_FRIENDS"];
  body: {
    ids: string[];
  };
};

export type GetFriendsPayload = {
  path: (typeof PATHS)["GET_FRIENDS"];
};

export type GetFriendsByAccountIdPayload = {
  path: (typeof PATHS)["GET_FRIENDS_BY_ACCOUNT_ID"];
  body: {
    myAccId: string;
  };
};

export type GetFriendByIdPayload = {
  path: (typeof PATHS)["GET_FRIEND_BY_ID"];
  body: {
    friendId: string;
  };
};

export type GetActiveTabsCountPayload = {
  path: (typeof PATHS)["GET_ACTIVE_TABS_COUNT"];
};

export type ResultByPath = {
  [PATHS.GET_ACCOUNTS]: ReturnType<typeof get_accounts>;
  [PATHS.ADD_ACCOUNTS]: void;
  [PATHS.DELETE_ACCOUNTS]: void;
  [PATHS.PUT_ACCOUNTS]: void;
  [PATHS.PUT_FRIENDS]: void;
  [PATHS.LOGIN]: void;
  [PATHS.GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P]: string;
  [PATHS.GET_FRIENDS]: ReturnType<typeof friends_service.getList>;
  [PATHS.ADD_FRIENDS]: ReturnType<typeof friends_service.add>;
  [PATHS.DELETE_FRIENDS]: void;
  [PATHS.GET_FRIENDS_BY_ACCOUNT_ID]: ReturnType<
    typeof friends_service.getFriendsByAccountId
  >;
  [PATHS.GET_FRIEND_BY_ID]: ReturnType<typeof friends_service.getFriendById>;
  [PATHS.GET_ACTIVE_TABS_COUNT]: { count: number };
};

export type BackMiddlewarePayload = Extract<
  | GetAccountsPayload
  | DeleteAccountsPayload
  | PutAccountsPayload
  | PutFriendsPayload
  | AddAccountsPayload
  | GetPeerIdByAccIdForLibp2pPayload
  | LoginPayload
  | AddFriendsPayload
  | DeleteFriendsPayload
  | GetFriendsPayload
  | GetFriendsByAccountIdPayload
  | GetFriendByIdPayload
  | GetActiveTabsCountPayload,
  {
    path: keyof typeof PATHS;
    body?: any;
  }
>;

export type BackMiddlewareEvent = {
  idRequest: IdRequest;
  type: (typeof EVENT_TYPES)["FETCH"] | (typeof EVENT_TYPES)["SUBSCRIBE"];
  payload: BackMiddlewarePayload;
};

export async function backMiddleware(
  props: BackMiddlewareProps,
  onSubscriptionUpdate?: (data: any) => void,
): Promise<any> {
  devLog("backMiddleware starting with props:", props, "type:", props.type);

  try {
    if (props.type === EVENT_TYPES.FETCH) {
      devLog("backMiddleware: перенаправляем FETCH в promiseMiddleware");
      return await promiseMiddleware(props);
    }

    if (props.type === EVENT_TYPES.SUBSCRIBE) {
      devLog(
        "backMiddleware: перенаправляем SUBSCRIBE в subscriptionMiddleware",
      );
      return await subscriptionMiddleware(props, onSubscriptionUpdate);
    }

    prodError("backMiddleware: неподдерживаемый тип запроса:", props.type);
    return null;
  } catch (err) {
    prodError("backMiddleware error:", err);
    throw err;
  }
}
