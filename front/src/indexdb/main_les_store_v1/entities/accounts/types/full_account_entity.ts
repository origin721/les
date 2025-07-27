import type { AccountEntity } from "./account_entity";


export type AccountEntityFull = AccountEntity & {
  id: string;
  version: number; // Версия записи для миграций
  lastUpdated: number; // Timestamp последнего обновления
  date_created: string;
};
