/**
 * Базовая сущность друга
 * Хранится в IndexedDB с обычным ID базы данных
 */
export type FriendEntity = {
  /** Публичное имя друга */
  namePub: string;
  /** ID аккаунта пользователя */
  // TODO: сделать проверку что расшифрованный accId соотвествует если буду по той таблице идти
  /**
   * @deprecated use explicitMyAccId
   */
  myAccId: string;
  explicitMyAccId: string;
  /** Публичный ключ libp2p друга */
  friendPubKeyLibp2p: string;
  // TODO: добавить миграцию на добавление ключа
  joinFriendId: string;
};
