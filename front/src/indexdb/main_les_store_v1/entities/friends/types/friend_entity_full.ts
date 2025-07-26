import type { CommonEntity } from "../../entity_service/types/CommonEntity";
import type { FriendEntity } from "./friend_entity";

/**
 * Полная сущность друга с зашифрованным ID
 * Используется для безопасной работы с доверенными данными
 */
export type FriendEntityFull = CommonEntity & FriendEntity;
