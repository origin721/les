import type { MyEnum } from "../../../types/common";

export const FRONT_MIDDLEWARE_ACTIONS: KeyEqualValue = getChannelNames();

type KeyEqualValue = MyEnum<ReturnType<typeof getChannelNames>>;

function getChannelNames() {
  return Object.freeze({
    //TMP: 'FRONT_MIDDLEWARE',
  })
}