/**
 * Для отключения ошибок, если не указать catch то он обязательно console.error уронит его, бывает не всегда catch обрабатывается сразу иногда просто создаётся промис
 * @example
 * ```js
 * fetch(url, { signal })
 *   .then(response => response.json())
 *   .catch(error => {
 *     error.suppressConsoleErrorOnce = true; 
 *     return Promise.reject(error);
 *   });
 * ```
 */
export const addEventListenerUnhandledrejection = () => {
  window.addEventListener('unhandledrejection', (_event) => {
    const event = _event as (
      typeof _event
      & {reason: {
        suppressConsoleErrorOnce?: boolean
      }}
    )
    if (_event.reason instanceof DOMException) {
      if(event.reason.suppressConsoleErrorOnce) {
        event.preventDefault();
        delete event.reason.suppressConsoleErrorOnce; // Удаляем флаг
      }
    }
  });
}