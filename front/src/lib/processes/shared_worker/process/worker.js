let counter = 0;

self.onmessage = function (event) {
    console.log("Worker received:", event.data);
    console.log('workCount: ' + (++counter));
  
    // Пример обработки данных: реверс строки
    // const result = event.data.split('').reverse().join('');
    const result = {
      workerDataParam: event.data,
      counter,
    }
    
    // Отправляем данные обратно
    self.postMessage(result);
  };