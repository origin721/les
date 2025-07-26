import type { CommonEntity } from "../../entity_service/types/CommonEntity";
import type { FriendIdsEntity } from "./FriendIdsEntity";

/**
 * Базовая сущность друга
 * Хранится в IndexedDB с обычным ID базы данных
 */
export type FriendIdsFull = CommonEntity & FriendIdsEntity;
