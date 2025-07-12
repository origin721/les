import { prodError } from "../debug/logger";

export function safeCallback<T extends any[]>(
  callback: (...args: T) => void,
  errorMessage?: string
) {
  return (...args: T) => {
    try {
      callback(...args);
    } catch (error) {
      prodError(errorMessage || 'Callback error:', error);
    }
  };
}

export function safeCallbackList<T extends any[]>(
  callbacks: ((...args: T) => void)[],
  errorMessage?: string
) {
  return (...args: T) => {
    callbacks.forEach(callback => safeCallback(callback, errorMessage)(...args));
  };
}

export function safeAsyncCallback<T extends any[]>(
  callback: (...args: T) => Promise<void>,
  errorMessage?: string
) {
  return async (...args: T) => {
    try {
      await callback(...args);
    } catch (error) {
      prodError(errorMessage || 'Async callback error:', error);
    }
  };
}
