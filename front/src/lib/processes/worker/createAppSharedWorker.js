export function createAppSharedWorker() {
  // Создаем общий воркер
  const sharedWorker = new SharedWorker('/src/lib/processes/worker/process/sharedWorker.js');

  // Отправляем сообщение общему воркеру
  sharedWorker.port.postMessage({ message: "Hello, shared worker!" });

  // Получаем ответ от общего воркера
  sharedWorker.port.onmessage = function (event) {
    console.log('Received from shared worker:', event.data);
  };

  // Открываем порт, чтобы начать взаимодействие
  sharedWorker.port.start();
}
