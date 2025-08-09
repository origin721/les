import type { CommonEntity } from "../../entity_service/types/CommonEntity";
import { RoomEntity } from "./room_entity";

/**
 * Полная сущность комнаты с зашифрованным ID
 * Используется для безопасной работы с доверенными данными
 */
export type RoomEntityFull = CommonEntity & {
  /** Зашифрованный/доверенный ID комнаты для безопасности */
  id: string;
} & RoomEntity;
