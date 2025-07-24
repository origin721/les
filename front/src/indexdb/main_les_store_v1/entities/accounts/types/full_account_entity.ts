import type { AccountEntity } from "./account_entity";


export type AccountEntityFull = AccountEntity & {
  id: string;
};
