import type { RoomEntity, RoomEntityFull } from "./types";
// TODO: файл мусор но как идею оставлю
/**
 * Проверяет валидность данных комнаты
 */
export function validateRoomEntity(room: RoomEntity): boolean {
  if (!room.sourceName || typeof room.sourceName !== "string") {
    return false;
  }
  if (!room.viewName || typeof room.viewName !== "string") {
    return false;
  }
  if (!room.myAccId || typeof room.myAccId !== "string") {
    return false;
  }
  return true;
}

/**
 * Проверяет валидность полной сущности комнаты (с ID)
 */
export function validateRoomEntityFull(room: RoomEntityFull): boolean {
  if (!room.id || typeof room.id !== "string") {
    return false;
  }
  return validateRoomEntity(room);
}

/**
 * Фильтрует комнаты по аккаунту
 */
export function filterRoomsByAccount(
  rooms: RoomEntityFull[],
  accountId: string,
): RoomEntityFull[] {
  return rooms.filter((room) => room.myAccId === accountId);
}

/**
 * Находит комнату по sourceName
 */
export function findRoomBySourceName(
  rooms: RoomEntityFull[],
  sourceName: string,
): RoomEntityFull | null {
  return rooms.find((room) => room.sourceName === sourceName) || null;
}

/**
 * Находит комнату по viewName
 */
export function findRoomByViewName(
  rooms: RoomEntityFull[],
  viewName: string,
): RoomEntityFull | null {
  return rooms.find((room) => room.viewName === viewName) || null;
}

/**
 * Группирует комнаты по аккаунтам
 */
export function groupRoomsByAccount(
  rooms: RoomEntityFull[],
): Record<string, RoomEntityFull[]> {
  const grouped: Record<string, RoomEntityFull[]> = {};

  for (const room of rooms) {
    if (!grouped[room.myAccId]) {
      grouped[room.myAccId] = [];
    }
    grouped[room.myAccId].push(room);
  }

  return grouped;
}

/**
 * Сортирует комнаты по viewName
 */
export function sortRoomsByViewName(rooms: RoomEntityFull[]): RoomEntityFull[] {
  return [...rooms].sort((a, b) => a.viewName.localeCompare(b.viewName));
}

/**
 * Сортирует комнаты по sourceName
 */
export function sortRoomsBySourceName(
  rooms: RoomEntityFull[],
): RoomEntityFull[] {
  return [...rooms].sort((a, b) => a.sourceName.localeCompare(b.sourceName));
}

/**
 * Создает копию комнаты без чувствительных данных (если такие есть)
 */
export function sanitizeRoom(room: RoomEntityFull): RoomEntityFull {
  // Для комнат пока нет чувствительных данных, но метод оставляем для будущего
  return { ...room };
}

/**
 * Проверяет уникальность sourceName среди комнат
 */
export function isSourceNameUnique(
  rooms: RoomEntityFull[],
  sourceName: string,
  excludeId?: string,
): boolean {
  return !rooms.some(
    (room) =>
      room.sourceName === sourceName &&
      (excludeId ? room.id !== excludeId : true),
  );
}

/**
 * Получает статистику комнат
 */
export function getRoomsStats(rooms: RoomEntityFull[]): {
  total: number;
  byAccount: Record<string, number>;
} {
  const stats = {
    total: rooms.length,
    byAccount: {} as Record<string, number>,
  };

  for (const room of rooms) {
    if (!stats.byAccount[room.myAccId]) {
      stats.byAccount[room.myAccId] = 0;
    }
    stats.byAccount[room.myAccId]++;
  }

  return stats;
}
