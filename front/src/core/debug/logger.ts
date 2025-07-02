/**
 * Система логирования с поддержкой дебаг режима
 * 
 * debugLog() - отображается только в дебаг режиме
 * forceLog() - отображается всегда (критические операции)
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

/**
 * Дебаг лог - показывается только когда включен дебаг режим
 * В продакшене (npm run build:prod) не отображается
 */
export const debugLog = (...args: any[]): void => {
  if (isDebugEnabled) {
    console.log('[DEBUG]', ...args);
  }
};

/**
 * Принудительный лог - показывается всегда
 * Используется для критических операций (миграции БД, важные системные события)
 */
export const forceLog = (...args: any[]): void => {
  console.log('[SYSTEM]', ...args);
};

/**
 * Информационный лог для дебага
 */
export const debugInfo = (...args: any[]): void => {
  if (isDebugEnabled) {
    console.info('[DEBUG-INFO]', ...args);
  }
};

/**
 * Предупреждающий лог для дебага
 */
export const debugWarn = (...args: any[]): void => {
  if (isDebugEnabled) {
    console.warn('[DEBUG-WARN]', ...args);
  }
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
