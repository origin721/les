/**
 * Базовая сущность комнаты
 * Хранится в IndexedDB с обычным ID базы данных
 */
export type RoomEntity = {
  /** ID комнаты в базе данных (незашифрованный) */
  // id: string;
  /** Источник имени комнаты */
  sourceName: string;
  /** Отображаемое имя комнаты */
  viewName: string;
  /** Версия записи для миграций */
  version: number;
  /** Timestamp последнего обновления */
  lastUpdated: number;
};
