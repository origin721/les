import type { CommonEntity } from "../../entity_service/types/CommonEntity";
import type { RoomIdsEntity } from "./RoomIdsEntity";

/**
 * Базовая сущность друга
 * Хранится в IndexedDB с обычным ID базы данных
 */
export type RoomIdsEntityFull = CommonEntity&RoomIdsEntity & {
  id: string;
};
