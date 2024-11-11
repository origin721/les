
export async function createAppSharedWorker() {
  const workerUrl = new URL('./process/sharedWorker.js', import.meta.url);
  // const worker = new WorkerModule.default();
  // Создаем общий воркер
  const sharedWorker = new SharedWorker(workerUrl, { type: 'module' });

  // Отправляем сообщение общему воркеру
  sharedWorker.port.postMessage({ message: "Hello, shared worker!" });

  // Получаем ответ от общего воркера
  sharedWorker.port.onmessage = function (event) {
    console.log('Received from shared worker:', event.data);
  };

  // Открываем порт, чтобы начать взаимодействие
  sharedWorker.port.start();
}
