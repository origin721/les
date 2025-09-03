import type { CommonEntity } from "../../entity_service/types/CommonEntity";
import type { RoomEntity } from "./room_entity";

/**
 * Полная сущность комнаты с зашифрованным ID
 * Используется для безопасной работы с доверенными данными
 */
export type RoomEntityFull = CommonEntity & RoomEntity;
