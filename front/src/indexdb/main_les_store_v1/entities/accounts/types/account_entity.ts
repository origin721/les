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
   * @deprecated use roomsIdJoin
   */
  roomIds?: string[]; // Связанные комнаты
  roomsIdJoin: string;
  /**
   * Пароль от сущностей
   */
  _pass: string;
};
