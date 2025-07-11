import { FriendEntity } from "./friend_entity";

/**
 * Полная сущность друга с зашифрованным ID
 * Используется для безопасной работы с доверенными данными
 */
export type FriendEntityFull = {
  /** Зашифрованный/доверенный ID друга для безопасности */
  id: string;
} & FriendEntity;
