import { KEYS } from './constants';
import type { KeyPair, PartnerKey } from '../../stores/api_keys_store';

// Утилиты для сериализации/десериализации с учетом Date объектов
function serializeKeys<T extends { createdAt: Date }>(keys: T[]): string {
  return JSON.stringify(keys.map(key => ({
    ...key,
    createdAt: key.createdAt.toISOString()
  })));
}

function deserializeKeys<T extends { createdAt: Date }>(json: string): T[] {
  try {
    const parsed = JSON.parse(json);
    return parsed.map((key: any) => ({
      ...key,
      createdAt: new Date(key.createdAt)
    }));
  } catch (error) {
    console.error('Ошибка при десериализации ключей:', error);
    return [];
  }
}

export const apiKeysStorage = {
  // Сохранение моих ключей
  saveMyKeys: (keys: KeyPair[]): void => {
    try {
      localStorage.setItem(KEYS.API_KEYS_MY_KEYS, serializeKeys(keys));
    } catch (error) {
      console.error('Ошибка при сохранении моих ключей:', error);
    }
  },

  // Загрузка моих ключей
  loadMyKeys: (): KeyPair[] => {
    try {
      const stored = localStorage.getItem(KEYS.API_KEYS_MY_KEYS);
      if (!stored) return [];
      return deserializeKeys<KeyPair>(stored);
    } catch (error) {
      console.error('Ошибка при загрузке моих ключей:', error);
      return [];
    }
  },

  // Сохранение ключей партнеров
  savePartnerKeys: (keys: PartnerKey[]): void => {
    try {
      localStorage.setItem(KEYS.API_KEYS_PARTNER_KEYS, serializeKeys(keys));
    } catch (error) {
      console.error('Ошибка при сохранении ключей партнеров:', error);
    }
  },

  // Загрузка ключей партнеров
  loadPartnerKeys: (): PartnerKey[] => {
    try {
      const stored = localStorage.getItem(KEYS.API_KEYS_PARTNER_KEYS);
      if (!stored) return [];
      return deserializeKeys<PartnerKey>(stored);
    } catch (error) {
      console.error('Ошибка при загрузке ключей партнеров:', error);
      return [];
    }
  },

  // Очистка всех ключей
  clearAllKeys: (): void => {
    try {
      localStorage.removeItem(KEYS.API_KEYS_MY_KEYS);
      localStorage.removeItem(KEYS.API_KEYS_PARTNER_KEYS);
    } catch (error) {
      console.error('Ошибка при очистке ключей:', error);
    }
  }
};
