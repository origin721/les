import type { MyEnum } from "../../../types/common";

export const FrontMiddlewareActions: KeyEqualValue = getChannelNames();

type KeyEqualValue = MyEnum<ReturnType<typeof getChannelNames>>;

function getChannelNames() {
  return Object.freeze({
    ADD_ACCOUNTS: 'ADD_ACCOUNTS',
    DELETE_ACCOUNTS: 'DELETE_ACCOUNTS',
    ADD_FRIENDS: 'ADD_FRIENDS',
    DELETE_FRIENDS: 'DELETE_FRIENDS',
    ADD_ROOMS: 'ADD_ROOMS',
    DELETE_ROOMS: 'DELETE_ROOMS',
  })
}
