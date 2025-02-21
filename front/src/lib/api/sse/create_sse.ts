import { create_safe_result } from "../../core/validation/create_safe_result";
import { generate_keys_curve25519, generate_keys_ed25519 } from "../../crypt";
import { PATHS_POST } from "../http/constants";
import { event_post } from "../http/event_post";

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
    console.log('sse: ', {eventData});
    // main_middleware(eventData);
    // console.log({list_connected});

    (async() => {
      const c25519 = await generate_keys_curve25519();
      const e25519 = await generate_keys_ed25519();

      event_post(
        {
          path: PATHS_POST.server_event_registration,
          body: {
            connection_id: 'sdfsdf',
          }
        },
        {
          pub_key_curve25519_client: c25519.publicKey,
          priv_key_curve25519_client: c25519.privateKey,
          pub_key_ed25519_client: e25519.publicKey,
          pub_key_curve25519_server: 'fcd046db8e4dd8248259c12db085dee9e5b8854c9e49894e3d4f48cf1853c16a',
        }
      );
    })();

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