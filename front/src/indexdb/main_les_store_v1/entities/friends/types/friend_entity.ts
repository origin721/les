/**
 * Базовая сущность друга
 * Хранится в IndexedDB с обычным ID базы данных
 */
export type FriendEntity = {
  /** Публичное имя друга */
  namePub: string;
  /** ID аккаунта пользователя */
  // TODO: сделать проверку что расшифрованный accId соотвествует если буду по той таблице идти
  myAccId: string;
  /** Публичный ключ libp2p друга */
  friendPubKeyLibp2p: string;
  /** Версия записи */
  version?: number;
  /** Дата последнего обновления */
  date_updated?: Date;
};
