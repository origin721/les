import { create_safe_result } from "../../core/validation/create_safe_result";

type CreateMyEventsProps = {
  url: string;
}

export const sse_connect = (
  p: CreateMyEventsProps,
) => {
  // Создаем новый объект EventSource и указываем URL для подключения
  const eventSource = new EventSource("http://localhost:8000/events");

  // Обрабатываем события, когда сервер отправляет данные
  eventSource.onmessage = function (event) {
    const eventData = event.data;
    console.log('sse: ', {eventData})
    // main_middleware(eventData);
    // console.log({list_connected});

    // console.log(eventData);
    // Выводим полученные данные на страницу
    //  document.getElementById('events').innerHTML += `<p>${eventData}</p>`;
  };

  // Обрабатываем ошибки
  eventSource.onerror = function (event) {
    console.clear();
    // TODO: доработать в интерфейс
    // console.error("EventSource failed:", event, get(events_store));
    // events_store.delete_registration_by_id()
    console.log({event}, 'Возможно сервер недоступен');
    // if (list_connected.length === 1) {
    //   const _p = list_connected.pop();
    //   if (_p) {
    //     events_store.delete_registration_by_id(_p);
    //     console.log('deleted: ', _p);
    //   }
    // }
  };
};

function validation() {
  const _v = create_safe_result();
}