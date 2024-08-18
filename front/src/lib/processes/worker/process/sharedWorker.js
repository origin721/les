// sharedWorker.js

let counter = 0;

self.onconnect = function (event) {
  
    event.ports.forEach(port => {
        port.onmessage = function (e) {
            console.log("SharedWorker received:", e.data);
            
            // Ответ отправляем на порт, связанный с вкладкой
            port.postMessage((++counter)+"Shared worker response: " + e.data.message);
          };
    });

  };
  