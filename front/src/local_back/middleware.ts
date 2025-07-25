import type {
  AccountEntity,
  AccountEntityPut,
} from "../indexdb/main_les_store_v1/entities/accounts/types";
import { EVENT_TYPES, PATHS } from "./constant";
import type { FriendEntity } from "../indexdb/main_les_store_v1/entities/friends/types/friend_entity";
import type { FriendEntityPut } from "../indexdb/main_les_store_v1/entities/friends/put_friends";
import { devLog, prodError } from "../core/debug/logger";
import { promiseMiddleware, type PromiseMiddlewareProps } from "./promise_middleware";
import { subscriptionMiddleware, type SubscriptionMiddlewareProps } from "./subscription_middleware";
import type { friends_service } from "./modules/friends_service";
import type { get_accounts } from "../indexdb/main_les_store_v1/entities/accounts/get_accounts";
import type { AddRoomParam } from "../indexdb/main_les_store_v1/entities/rooms/add_room";
import type { AccountDto } from "./modules/accounts_service";

type IdRequest = string | number;
export type BackMiddlewareProps = SubscriptionMiddlewareProps | PromiseMiddlewareProps;

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
    explicitMyAccId: string;
  };
};

export type AddRoomsPayload = {
  path: (typeof PATHS)["ADD_ROOMS"];
  body: AddRoomParam;
};

export type GetActiveTabsCountPayload = {
  path: (typeof PATHS)["GET_ACTIVE_TABS_COUNT"];
};

export type GetFriendsByIdSubscribePayload = {
  path: (typeof PATHS)["GET_FRIENDS_BY_ID_SUBSCRIBE"];
};

export type GetAccByIdPayload = {
  path: (typeof PATHS)["GET_ACC_BY_ID"];
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
  [PATHS.GET_ACC_BY_ID]: { accounts_by_id: Record<string, AccountDto> };
};

export type BackMiddlewarePayloadFetch = Extract<
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
  | AddRoomsPayload,
  {
    path: keyof typeof PATHS;
    body?: any;
  }
>;

export type BackMiddlewarePayload = Extract<
  BackMiddlewarePayloadFetch
  | BackMiddlewarePayloadSubscribe,
  {
    path: keyof typeof PATHS;
    body?: any;
  }
>;

export type BackMiddlewareEventFetch = {
  idRequest: IdRequest;
  type: (typeof EVENT_TYPES)["FETCH"];
  payload: BackMiddlewarePayloadFetch;
};


export type BackMiddlewarePayloadSubscribe = Extract<
  | GetAccByIdPayload
  | GetFriendsByIdSubscribePayload
  | GetActiveTabsCountPayload,
  {
    path: keyof typeof PATHS;
    body?: any;
  }
>;

export type BackMiddlewareEventSubscribe = {
  idRequest: IdRequest;
  type: (typeof EVENT_TYPES)["SUBSCRIBE"];
  payload: BackMiddlewarePayloadSubscribe;
};

export type BackMiddlewareEvent = {
  idRequest: IdRequest;
  type: (typeof EVENT_TYPES)["FETCH"] | (typeof EVENT_TYPES)["SUBSCRIBE"];
  payload: BackMiddlewarePayload;
};

export async function backMiddleware(
  props: BackMiddlewareProps,
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
      return subscriptionMiddleware(props);
    }

    prodError("backMiddleware: неподдерживаемый тип запроса:", props.type);
    return null;
  } catch (err) {
    prodError("backMiddleware error:", err);
    throw err;
  }
}
