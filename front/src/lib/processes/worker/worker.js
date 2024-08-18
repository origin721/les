// main.js

// Создаем воркера
export const worker = new Worker('/src/lib/processes/worker/process/worker.js');
testCode()
function testCode() {
  // Отправляем JSON данные воркеру
  const data = { message: "Hello, Worker!" };
  worker.postMessage(JSON.stringify(data));

  // Получаем данные от воркера
  worker.onmessage = function (event) {
    console.log("Main received:", event.data);
  };

  // Обработка ошибок воркера
  worker.onerror = function (error) {
    console.error("Error in worker:", error);
  };
}

