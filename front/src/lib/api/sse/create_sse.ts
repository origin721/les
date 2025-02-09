import { create_safe_result } from "../../core/validation/create_safe_result";
import { generate_keys_curve25519 } from "../../crypt";

type CreateMyEventsProps = {
  url: string;
}
type Secure = {
  pubKey: string;
  privKey: string;
}


export const sse_connect = (
  p: CreateMyEventsProps,
  secureParam: Secure,
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
    //  documentmodel.getElementById('events').innerHTML += `<p>${eventData}</p>`;
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

async function connect() {
  const keys = await generate_keys_curve25519();


}

function validation() {
  const _v = create_safe_result();
}