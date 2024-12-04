import type { MyEnum } from "../../types/common";

export const PATHS: KeyEqualValue = getChannelPaths();

type KeyEqualValue = MyEnum<ReturnType<typeof getChannelPaths>>;

function getChannelPaths() {
  return Object.freeze({
    GET_ACCOUNTS: 'GET_ACCOUNTS',
  })
}