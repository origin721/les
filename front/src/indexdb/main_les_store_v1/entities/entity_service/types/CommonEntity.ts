export type CommonEntity = {
  id: string;
  version: number; // Версия записи для миграций
  lastUpdated: number; // Timestamp последнего обновления
  explicitMyAccId: string; // кем зашифрованно id
}