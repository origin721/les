import type { MyEnum } from "../../types/common";

export const PATHS: KeyEqualValue = getChannelPaths();

type KeyEqualValue = MyEnum<ReturnType<typeof getChannelPaths>>;

function getChannelPaths() {
  return Object.freeze({
    GET_ACCOUNTS: 'GET_ACCOUNTS',
    DELETE_ACCOUNTS: 'DELETE_ACCOUNTS',
    ADD_ACCOUNTS: 'ADD_ACCOUNTS',
    PUT_ACCOUNTS: 'PUT_ACCOUNTS',
    PUT_FRIENDS: 'PUT_FRIENDS',
    GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P: 'GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P',
    LOGIN: 'LOGIN',
  })
}