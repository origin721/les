/**
 * Система логирования с разграничением на продакшен и дев логи
 * 
 * === ПРОДАКШЕН ЛОГИ (отображаются всегда) ===
 * prodError() - критические ошибки
 * prodWarn() - важные предупреждения  
 * prodInfo() - важная системная информация
 * prodLog() - базовые операции системы
 * 
 * === ДЕВ ЛОГИ (только в дебаг режиме) ===
 * devLog() - общий дебаг
 * devAPI() - API запросы и ответы
 * devDB() - операции с базой данных
 * devCrypto() - криптографические операции
 * devUI() - пользовательский интерфейс
 * devLibP2P() - P2P соединения
 * devAuth() - аутентификация
 * devMigration() - миграции данных
 */

// Проверяем состояние дебаг режима
const getDebugState = (): boolean => {
  // В продакшен режиме (build:prod) принудительно отключаем дебаг
  if (import.meta.env.MODE === 'production') {
    return false;
  }
  
  // Проверяем локальную настройку из .env.local
  const envDebug = import.meta.env.VITE_is_debug_enable;
  if (envDebug !== undefined) {
    return envDebug === 'true' || envDebug === true;
  }
  
  // Fallback на VITE_DEBUG
  return import.meta.env.VITE_DEBUG === 'true' || import.meta.env.VITE_DEBUG === true;
};

const isDebugEnabled = getDebugState();

// Для минимизации логов в продакшене - проверяем что дебаг включен
const shouldLog = (): boolean => {
  return isDebugEnabled;
};

// =================================================================
// ПРОДАКШЕН ЛОГИ - отображаются всегда (важные системные события)
// =================================================================

/**
 * ПРОДАКШЕН: Критические ошибки (миграции БД, загрузка аккаунтов, P2P подключения)
 */
export const prodError = (...args: any[]): void => {
  console.error('[PROD-ERROR]', ...args);
};

/**
 * ПРОДАКШЕН: Важные предупреждения (проблемы с паролями, сетевые ошибки)
 */
export const prodWarn = (...args: any[]): void => {
  if (!shouldLog()) return;
  console.warn('[PROD-WARN]', ...args);
};

/**
 * ПРОДАКШЕН: Важная системная информация (старт миграций, успешная загрузка данных)
 */
export const prodInfo = (...args: any[]): void => {
  if (!shouldLog()) return;
  console.info('[PROD-INFO]', ...args);
};

/**
 * ПРОДАКШЕН: Базовые операции системы (добавление друзей, обновление данных)
 */
export const prodLog = (...args: any[]): void => {
  if (!shouldLog()) return;
  console.log('[PROD]', ...args);
};

// =================================================================
// ДЕВ ЛОГИ - отображаются только в дебаг режиме
// =================================================================

/**
 * ДЕВ: Общие дебаг сообщения
 */
export const devLog = (...args: any[]): void => {
  if (isDebugEnabled) {
    console.log('[DEV]', ...args);
  }
};

/**
 * ДЕВ: API запросы, ответы, timing
 */
export const devAPI = (...args: any[]): void => {
  if (isDebugEnabled) {
    console.log('[DEV-API]', ...args);
  }
};

/**
 * ДЕВ: Операции с IndexedDB, запросы к базе
 */
export const devDB = (...args: any[]): void => {
  if (isDebugEnabled) {
    console.log('[DEV-DB]', ...args);
  }
};

/**
 * ДЕВ: Криптографические операции, генерация ключей, шифрование
 */
export const devCrypto = (...args: any[]): void => {
  if (isDebugEnabled) {
    console.log('[DEV-CRYPTO]', ...args);
  }
};

/**
 * ДЕВ: Пользовательский интерфейс, состояние компонентов
 */
export const devUI = (...args: any[]): void => {
  if (isDebugEnabled) {
    console.log('[DEV-UI]', ...args);
  }
};

/**
 * ДЕВ: LibP2P соединения, broadcast сообщения
 */
export const devLibP2P = (...args: any[]): void => {
  if (isDebugEnabled) {
    console.log('[DEV-LIBP2P]', ...args);
  }
};

/**
 * ДЕВ: Аутентификация, проверка паролей
 */
export const devAuth = (...args: any[]): void => {
  if (isDebugEnabled) {
    console.log('[DEV-AUTH]', ...args);
  }
};

/**
 * ДЕВ: Миграции данных, детальная информация
 */
export const devMigration = (...args: any[]): void => {
  if (isDebugEnabled) {
    console.log('[DEV-MIGRATION]', ...args);
  }
};

// =================================================================
// ОБРАТНАЯ СОВМЕСТИМОСТЬ (старые функции)
// =================================================================

/**
 * @deprecated Используйте devLog()
 */
export const debugLog = (...args: any[]): void => {
  devLog(...args);
};

/**
 * @deprecated Используйте prodError() или prodInfo()
 */
export const forceLog = (...args: any[]): void => {
  prodInfo(...args);
};

/**
 * @deprecated Используйте devLog()
 */
export const debugInfo = (...args: any[]): void => {
  devLog(...args);
};

/**
 * @deprecated Используйте devLog() или prodWarn()
 */
export const debugWarn = (...args: any[]): void => {
  devLog(...args);
};

/**
 * Показать текущее состояние дебаг режима
 */
export const getDebugInfo = () => {
  return {
    isDebugEnabled,
    mode: import.meta.env.MODE,
    envVars: {
      VITE_is_debug_enable: import.meta.env.VITE_is_debug_enable,
      VITE_DEBUG: import.meta.env.VITE_DEBUG
    }
  };
};

// Логируем состояние системы при инициализации (только в дебаге)
if (isDebugEnabled) {
  console.group('[DEBUG-SYSTEM] Logger initialized');
  console.log('Debug enabled:', isDebugEnabled);
  console.log('Build mode:', import.meta.env.MODE);
  console.log('Environment variables:', {
    VITE_is_debug_enable: import.meta.env.VITE_is_debug_enable,
    VITE_DEBUG: import.meta.env.VITE_DEBUG
  });
  console.groupEnd();
}
