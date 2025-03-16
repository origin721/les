import type { MyEnum } from "../../../types/common";

export const CHANNEL_NAMES: KeyEqualValue = getChannelNames();

type KeyEqualValue = MyEnum<ReturnType<typeof getChannelNames>>;

function getChannelNames() {
  return Object.freeze({
    FRONT_MIDDLEWARE: 'FRONT_MIDDLEWARE',
  })
}