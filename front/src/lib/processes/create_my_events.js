export const create_my_events = () => {
         // Создаем новый объект EventSource и указываем URL для подключения
         const eventSource = new EventSource('http://localhost:8080/events');
        
         // Обрабатываем события, когда сервер отправляет данные
         eventSource.onmessage = function(event) {
             const eventData = event.data;
             console.log(eventData);
             // Выводим полученные данные на страницу
            //  document.getElementById('events').innerHTML += `<p>${eventData}</p>`;
         };
         
         // Обрабатываем ошибки
         eventSource.onerror = function(event) {
             console.error('EventSource failed:', event);
         };
};