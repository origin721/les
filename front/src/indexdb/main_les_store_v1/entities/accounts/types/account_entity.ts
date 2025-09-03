/**
 * Базовый тип сущности аккаунта
 */

export type HttpServerParam = {
  url: string;
  isActive: boolean;
  id: string;
};

export type AccountEntity = {
  namePub: string;
  pass: string;
  httpServers: HttpServerParam[];
  /**
   * @deprecated
   */
  friendsByIds: string[]; // Опциональное для обратной совместимости
  friendsIdJoin: string;
  /**
   * @deprecated use accounts_rooms_id
   */
  roomIds?: string[]; // Связанные комнаты
  accounts_rooms_id: string;
  /**
   * Пароль от сущностей
   */
  _pass: string;
};
