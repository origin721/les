import { toJson } from "../../../core/toJson";
import { EVENT_TYPES, PATHS } from "../../../local_back/constant";
import { backMiddleware } from "../../../local_back/middleware";
import { subscriptionMiddleware } from "../../../local_back/subscription_middleware";
import { devLog, prodError, prodWarn } from "../../../core/debug/logger";

// Глобальный реестр активных подключений
const activeTabs = new Set();
const subscribers = {
  activeTabsCount: new Map(), // subscriptionId -> {port, params}
};

// Улучшенная функция очистки мертвых портов
function cleanupDeadPorts() {
  devLog(
    "SharedWorker: запуск очистки мертвых портов, всего портов:",
    activeTabs.size,
  );

  const deadPorts = new Set();

  activeTabs.forEach((port) => {
    try {
      // Проверяем состояние порта через его readyState или отправляем ping
      if (port.readyState && port.readyState === "closed") {
        deadPorts.add(port);
        return;
      }

      // Пинг порт для проверки жизнеспособности
      port.postMessage(JSON.stringify({ type: "ping", timestamp: Date.now() }));
    } catch (error) {
      // Порт мертв - помечаем для удаления
      devLog("SharedWorker: обнаружен мертвый порт при ping:", error.message);
      deadPorts.add(port);
    }
  });

  // Удаляем мертвые порты
  deadPorts.forEach((port) => {
    removeTabbedPort(port);
  });

  if (deadPorts.size > 0) {
    devLog(
      "SharedWorker: очищено мертвых портов:",
      deadPorts.size,
      "осталось активных:",
      activeTabs.size,
    );
    notifyActiveTabsSubscribers();
  }
}

// Функция для безопасного удаления порта
function removeTabbedPort(port) {
  devLog("SharedWorker: удаление порта из activeTabs");
  activeTabs.delete(port);

  // Удаляем все подписки этого порта
  subscribers.activeTabsCount.forEach((subscription, subscriptionId) => {
    if (subscription.port === port) {
      devLog("SharedWorker: удаление подписки для порта:", subscriptionId);
      subscribers.activeTabsCount.delete(subscriptionId);
    }
  });
}

// Автоматическая очистка каждые 15 секунд для более быстрого отклика
setInterval(() => {
  cleanupDeadPorts();
}, 15000);

// Функция для уведомления всех подписчиков об изменении количества вкладок
function notifyActiveTabsSubscribers() {
  // ВАЖНО: Используем реальное количество активных вкладок
  const count = activeTabs.size;
  devLog(
    "SharedWorker: уведомление подписчиков о количестве вкладок:",
    count,
    "activeTabs.size:",
    activeTabs.size,
  );

  // Создаем список подписок для безопасного обхода
  const subscriptionsToNotify = Array.from(
    subscribers.activeTabsCount.entries(),
  );

  subscriptionsToNotify.forEach(([subscriptionId, subscription]) => {
    try {
      const response = {
        idRequest: subscriptionId,
        payload: { count: count },
      };
      subscription.port.postMessage(JSON.stringify(response));
      devLog(
        "SharedWorker: отправлено уведомление подписчику:",
        subscriptionId,
        "count:",
        count,
      );
    } catch (error) {
      prodError(
        "SharedWorker: ошибка при отправке уведомления подписчику:",
        subscriptionId,
        error,
      );
      // Удаляем неработающую подписку
      subscribers.activeTabsCount.delete(subscriptionId);
      // Также удаляем порт из activeTabs если он мертв
      removeTabbedPort(subscription.port);
    }
  });
}

self.onconnect = function (event) {
  devLog("SharedWorker: onconnect вызван, ports:", event.ports.length);

  event.ports.forEach((port, index) => {
    devLog("SharedWorker: настройка port", index);

    // Регистрируем активную вкладку
    activeTabs.add(port);
    devLog("SharedWorker: добавлена активная вкладка, всего:", activeTabs.size);

    // Обработка закрытия порта - используем несколько событий для надежности
    const handlePortClosure = () => {
      devLog("SharedWorker: порт закрыт");
      if (activeTabs.has(port)) {
        activeTabs.delete(port);

        // Удаляем все подписки этого порта
        subscribers.activeTabsCount.forEach((subscription, subscriptionId) => {
          if (subscription.port === port) {
            subscribers.activeTabsCount.delete(subscriptionId);
          }
        });

        devLog(
          "SharedWorker: удалена активная вкладка, всего:",
          activeTabs.size,
        );
        notifyActiveTabsSubscribers();
      }
    };

    // Используем несколько событий для надежного отслеживания закрытия
    port.addEventListener("close", handlePortClosure);

    // ИСПРАВЛЕНО: Единый обработчик сообщений (убрано дублирование port.onmessage)
    port.onmessage = function (e) {
      // Сначала проверяем на disconnect сообщения
      try {
        const data = JSON.parse(e.data.message || e.data);
        if (data.type === "disconnect") {
          devLog("SharedWorker: получено сообщение disconnect от порта");
          handlePortClosure();
          return;
        }
      } catch (parseError) {
        // Игнорируем ошибки парсинга - это обычные сообщения, не disconnect
      }

      // Затем обрабатываем обычные сообщения
      devLog("SharedWorker received:", e.data);
      listener(e.data, port);
    };
  });

  // КРИТИЧНО: Уведомляем подписчиков об изменении количества ПОСЛЕ обработки всех портов
  // Это обеспечивает синхронизацию между всеми вкладками
  setTimeout(() => {
    notifyActiveTabsSubscribers();
    devLog(
      "SharedWorker: принудительное уведомление после onconnect, activeTabs.size:",
      activeTabs.size,
    );
  }, 100); // Увеличено время для гарантии обработки
};

/**
 *
 * @param {*} data
 * @param {*} port
 * @returns
 */
async function listener(data, port) {
  try {
    devLog("SharedWorker listener starting, data:", data);

    /**
     * @type {import("../../../local_back/middleware").BackMiddlewareProps}
     */
    const props = toJson(data.message);
    devLog("SharedWorker parsed props:", props);

    // Проверить значения
    devLog("SharedWorker: EVENT_TYPES.FETCH =", EVENT_TYPES.FETCH);
    devLog("SharedWorker: props.type =", props?.type);
    devLog("SharedWorker: props.idRequest =", props?.idRequest);
    devLog("SharedWorker: props.payload =", props?.payload);

    if (props && (props.idRequest || props.idRequest === 0) && props.payload) {
      devLog("SharedWorker: условие idRequest + payload выполнено");

      if (props.type === EVENT_TYPES.FETCH) {
        devLog("SharedWorker: тип FETCH совпал, вызываем backMiddleware...");

        const result = await backMiddleware(props);
        devLog("SharedWorker: результат от backMiddleware:", result);

        const response = {
          idRequest: props.idRequest,
          payload: result,
        };
        devLog("SharedWorker: отправляем ответ:", response);

        port.postMessage(JSON.stringify(response));
        devLog("SharedWorker: ответ отправлен успешно");
      } else if (props.type === EVENT_TYPES.SUBSCRIBE) {
        devLog(
          "SharedWorker: тип SUBSCRIBE совпал, вызываем subscriptionMiddleware...",
        );

        // Создаем callback для отправки обновлений подписчикам
        const onSubscriptionUpdate = (data) => {
          try {
            const response = {
              idRequest: props.idRequest,
              payload: data,
            };
            port.postMessage(JSON.stringify(response));
            devLog(
              "SharedWorker: отправлено обновление подписки:",
              props.idRequest,
              data,
            );
          } catch (error) {
            prodError(
              "SharedWorker: ошибка отправки обновления подписки:",
              error,
            );
          }
        };

        // Вызываем subscription middleware
        const result = await subscriptionMiddleware(
          props,
          onSubscriptionUpdate,
        );
        devLog("SharedWorker: результат от subscriptionMiddleware:", result);

        if (result.subscriptionHandled) {
          // Обрабатываем специальные случаи
          if (props.payload.path === PATHS.GET_ACTIVE_TABS_COUNT) {
            const subscriptionId = props.idRequest;
            devLog(
              "SharedWorker: подписка на активные вкладки, subscriptionId:",
              subscriptionId,
            );

            // Сохраняем подписку
            subscribers.activeTabsCount.set(subscriptionId, {
              port: port,
              params: props.payload,
            });

            // Сразу отправляем текущее значение
            const response = {
              idRequest: subscriptionId,
              payload: { count: activeTabs.size },
            };
            port.postMessage(JSON.stringify(response));
            devLog(
              "SharedWorker: отправлено начальное значение count:",
              activeTabs.size,
              "для subscriptionId:",
              subscriptionId,
            );

            // КРИТИЧНО: После новой подписки уведомляем всех о текущем количестве
            setTimeout(() => {
              notifyActiveTabsSubscribers();
              devLog(
                "SharedWorker: принудительное уведомление после подписки, activeTabs.size:",
                activeTabs.size,
              );
            }, 100);

            // Дополнительное уведомление для обеспечения синхронизации
            setTimeout(() => {
              notifyActiveTabsSubscribers();
              devLog(
                "SharedWorker: дополнительное уведомление для синхронизации, activeTabs.size:",
                activeTabs.size,
              );
            }, 200);
          }
          // Здесь можно добавить обработку других типов подписок
        } else {
          prodError(
            "SharedWorker: подписка не обработана:",
            result.error || "неизвестная ошибка",
          );

          // Отправляем ошибку обратно
          const errorResponse = {
            idRequest: props.idRequest,
            error: result.error || "Подписка не поддерживается",
          };
          port.postMessage(JSON.stringify(errorResponse));
        }
      } else {
        prodWarn("SharedWorker: тип НЕ FETCH, props.type =", props.type);
      }
    } else {
      prodWarn("SharedWorker: условие НЕ выполнено:");
      devLog("   - idRequest:", props?.idRequest);
      devLog("   - payload:", props?.payload);
    }
  } catch (err) {
    prodError("SharedWorker listener ОШИБКА:", err);
    prodError("SharedWorker error stack:", err.stack);

    // 🚨 КРИТИЧНО: отправить ошибку обратно!
    try {
      const errorResponse = {
        idRequest: data.message
          ? JSON.parse(data.message).idRequest
          : "unknown",
        error: err.message,
        stack: err.stack,
      };
      devLog("SharedWorker: отправляем ошибку:", errorResponse);
      port.postMessage(JSON.stringify(errorResponse));
    } catch (sendError) {
      prodError("SharedWorker: не удалось отправить ошибку:", sendError);
    }
  }
}
