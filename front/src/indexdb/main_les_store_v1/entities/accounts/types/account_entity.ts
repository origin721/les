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
  friendsByIds?: string[]; // Опциональное для обратной совместимости
  roomIds?: string[]; // Связанные комнаты
};
