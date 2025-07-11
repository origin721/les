import { RoomEntity } from "./room_entity";

/**
 * Полная сущность комнаты с зашифрованным ID
 * Используется для безопасной работы с доверенными данными
 */
export type RoomEntityFull = {
  /** Зашифрованный/доверенный ID комнаты для безопасности */
  id: string;
} & RoomEntity;
