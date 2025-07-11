/**
 * Тип сущности аккаунта для обновления
 */

import type { HttpServerParam } from "./account_entity";

export type AccountEntityPut = {
  id: string;
  namePub: string;
  pass: string;
  httpServers: HttpServerParam[];
  friendsByIds?: string[];
  date_updated?: Date;
};
