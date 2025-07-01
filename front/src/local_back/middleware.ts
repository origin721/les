import { CHANNEL_NAMES } from "../core/broadcast_channel/constants/CHANNEL_NAMES";
import { FrontMiddlewareActions } from "../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
import type { PostMessageParamAddAccounts } from "../core/broadcast_channel/front_middleware_channel";
import { add_accounts, type AccountEntity } from "../indexdb/accounts/add_accounts";
import { delete_accounts } from "../indexdb/accounts/delete_accounts";
import { get_accounts, type Account } from "../indexdb/accounts/get_accounts";
import { login } from "../indexdb/accounts/login";
import { put_accounts, type AccountEntityPut } from "../indexdb/accounts/put_accounts";
import { back_store } from "./back_store";
import { EVENT_TYPES, PATHS } from "./constant";
import { accounts_service } from "./modules/accounts_service";
import { friends_service } from "./modules/friends_service";
import type { FriendEntity } from "../indexdb/friends/add_friend";

type IdRequest = string | number;
export type BackMiddlewareProps = {
  type: typeof EVENT_TYPES['FETCH'];
  payload: BackMiddlewarePayload;
  /**
   * Индификатор который вернётся в ответе
   * например для shared worker что бы было понятно
   * что это ответ для этого запроса
   */
  idRequest: IdRequest;
}

export type AddAccountsPayload = {
  path: typeof PATHS['ADD_ACCOUNTS'];
  body: {
    list: AccountEntity[];
  };
}

export type DeleteAccountsPayload = {
  path: typeof PATHS['DELETE_ACCOUNTS'];
  body: {
    ids: string[];
  };
}

export type PutAccountsPayload = {
  path: typeof PATHS['PUT_ACCOUNTS'];
  body: {
    list: AccountEntityPut[];
  };
}

export type PutFriendsPayload = {
  path: typeof PATHS['PUT_FRIENDS'];
  body: {
    list: AccountEntityPut[];
  };
}

export type LoginPayload = {
  path: typeof PATHS['LOGIN'];
  body: {
    pass: string;
  };
}

export type GetAccountsPayload = {
  path: typeof PATHS['GET_ACCOUNTS'];
}

export type GetPeerIdByAccIdForLibp2pPayload = {
  path: typeof PATHS['GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P'];
  body: {
    accId: string;
  }
}

export type AddFriendsPayload = {
  path: typeof PATHS['ADD_FRIENDS'];
  body: {
    list: FriendEntity[];
  };
}

export type DeleteFriendsPayload = {
  path: typeof PATHS['DELETE_FRIENDS'];
  body: {
    ids: string[];
  };
}

export type GetFriendsPayload = {
  path: typeof PATHS['GET_FRIENDS'];
}

export type GetFriendsByAccountIdPayload = {
  path: typeof PATHS['GET_FRIENDS_BY_ACCOUNT_ID'];
  body: {
    myAccId: string;
  };
}

export type GetFriendByIdPayload = {
  path: typeof PATHS['GET_FRIEND_BY_ID'];
  body: {
    friendId: string;
  };
}

export type ResultByPath = {
  [PATHS.GET_ACCOUNTS]: ReturnType<typeof get_accounts>;
  [PATHS.ADD_ACCOUNTS]: void;
  [PATHS.DELETE_ACCOUNTS]: void;
  [PATHS.PUT_ACCOUNTS]: void;
  [PATHS.LOGIN]: void;
  [PATHS.GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P]: string;
  [PATHS.GET_FRIENDS]: ReturnType<typeof friends_service.getList>;
  [PATHS.ADD_FRIENDS]: void;
  [PATHS.DELETE_FRIENDS]: void;
  [PATHS.GET_FRIENDS_BY_ACCOUNT_ID]: ReturnType<typeof friends_service.getFriendsByAccountId>;
  [PATHS.GET_FRIEND_BY_ID]: ReturnType<typeof friends_service.getFriendById>;
};

export type BackMiddlewarePayload = Extract<
  GetAccountsPayload
  |DeleteAccountsPayload
  |PutAccountsPayload
  |AddAccountsPayload
  |GetPeerIdByAccIdForLibp2pPayload
  |LoginPayload
  |AddFriendsPayload
  |DeleteFriendsPayload
  |GetFriendsPayload
  |GetFriendsByAccountIdPayload
  |GetFriendByIdPayload
,{
  path: keyof typeof PATHS;
  body?: any;
}>;

export type BackMiddlewareEvent = {
  idRequest: IdRequest;
  type: typeof EVENT_TYPES['FETCH'];
  payload: BackMiddlewarePayload;
}



export async function backMiddleware(
  props: BackMiddlewareProps
 ): Promise<any> {
  //console.log('worker-shared',{props});

  try {
    // Account handlers
    if (props.payload.path === PATHS.LOGIN) {
      return await accounts_service.onLogin(props.payload);
    }
    if (props.payload.path === PATHS.GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P) {
      return await accounts_service.getPeerIdForLibp2p(props.payload.body.accId);
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
      return await friends_service.add(props.payload.body.list);
    }
    if (props.payload.path === PATHS.DELETE_FRIENDS) {
      return await friends_service.delete(props.payload.body.ids);
    }
    if (props.payload.path === PATHS.GET_FRIENDS_BY_ACCOUNT_ID) {
      return await friends_service.getFriendsByAccountId(props.payload.body.myAccId);
    }
    if (props.payload.path === PATHS.GET_FRIEND_BY_ID) {
      return await friends_service.getFriendById(props.payload.body.friendId);
    }
  }
  catch (err) {
    console.error(err);
  }

  return null;

 //return new Promise((res, rej) => {
 //  setTimeout(() => {
 //    res({aaa:'vvvv', props});
 //    channel.postMessage({ action: 'notify', data: 'Hello, tabs!2' });
 //  }, 5000);
 //});
}
