/**
 * Модуль валидации для криптографических ключей
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Валидация публичного ключа Curve25519
 * Curve25519 публичные ключи должны быть 32 байта в base64 кодировке
 */
export function validateCurve25519PublicKey(publicKey: string): ValidationResult {
  if (!publicKey?.trim()) {
    return { isValid: false, error: 'Публичный ключ не может быть пустым' };
  }

  const trimmedKey = publicKey.trim();
  
  // Проверка base64 формата
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(trimmedKey)) {
    return { isValid: false, error: 'Публичный ключ должен быть в формате base64' };
  }

  try {
    const decoded = atob(trimmedKey);
    if (decoded.length !== 32) {
      return { isValid: false, error: 'Публичный ключ Curve25519 должен быть 32 байта' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Неверный формат base64' };
  }
}

/**
 * Валидация имени ключа
 */
export function validateKeyName(name: string, existingNames: string[] = []): ValidationResult {
  if (!name?.trim()) {
    return { isValid: false, error: 'Имя ключа не может быть пустым' };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Имя ключа должно содержать минимум 2 символа' };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Имя ключа не должно превышать 50 символов' };
  }

  if (existingNames.includes(trimmedName)) {
    return { isValid: false, error: 'Ключ с таким именем уже существует' };
  }

  return { isValid: true };
}

/**
 * Валидация публичного ключа ED25519 для подписей
 * ED25519 публичные ключи также 32 байта в base64
 */
export function validateED25519PublicKey(publicKey: string): ValidationResult {
  // ED25519 имеет такой же формат как Curve25519
  return validateCurve25519PublicKey(publicKey);
}
