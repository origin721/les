import type { AccountDto } from "../../local_back/modules/accounts_service";
import type { FrontMiddlewareActions } from "./constants/FRONT_MIDDLEWARE_ACTIONS";

export type FriendDto = {
  id: string;
  namePub: string;
  myAccId: string;
}

export type RoomDto = {
  id: string;
  sourceName: string;
  viewName: string;
  myAccId: string;
}

export type PostMessageParamDeleteAccounts = {
  action: typeof FrontMiddlewareActions['DELETE_ACCOUNTS'],
  data: {
    ids: string[];
  },
}

export type PostMessageParamAddAccounts = {
  action: typeof FrontMiddlewareActions['ADD_ACCOUNTS'],
  data: {
    list: AccountDto[];
  },
}

export type PostMessageParamAddFriends = {
  action: typeof FrontMiddlewareActions['ADD_FRIENDS'],
  data: {
    list: FriendDto[];
  },
}

export type PostMessageParamDeleteFriends = {
  action: typeof FrontMiddlewareActions['DELETE_FRIENDS'],
  data: {
    ids: string[];
  },
}

export type PostMessageParamAddRooms = {
  action: typeof FrontMiddlewareActions['ADD_ROOMS'],
  data: {
    list: RoomDto[];
  },
}

export type PostMessageParamDeleteRooms = {
  action: typeof FrontMiddlewareActions['DELETE_ROOMS'],
  data: {
    ids: string[];
  },
}

export type PostMessageParamCloseAllTabs = {
  action: typeof FrontMiddlewareActions['CLOSE_ALL_TABS'],
  data: {
    excludeCurrentTab?: boolean; // исключить текущую вкладку
    reason?: string; // причина закрытия
  },
}

export type PostMessageParam = Extract<
  PostMessageParamAddAccounts
  | PostMessageParamDeleteAccounts
  | PostMessageParamAddFriends
  | PostMessageParamDeleteFriends
  | PostMessageParamAddRooms
  | PostMessageParamDeleteRooms
  | PostMessageParamCloseAllTabs
  ,
  {
    action: string;
    data: any;
  }
>
