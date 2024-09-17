import { get } from "svelte/store";
import { PATHS_POST_EVENTS, event_post } from "../../api/http/event_post";
import { events_store } from "./events_store";

type MyEvents = MyEventConnect;
const CLIENT_PATHS = Object.freeze({
  connect_success: "connect_success",
  ping: "ping",
  response_ok: 'response_ok',
});
type MyEventConnect = {
  path: (typeof CLIENT_PATHS)["connect_success"];
  payload: MyEventConnectPayload;
};

type MyEventConnectPayload = {
  response_id: string;
  /**
   * @prop {string} user_id это id сгенерировано сервером
   * для клиента, сам клиент не мог его сгенерировать, клиенту не терять
   * так как повторно не высылается
   */
  user_id: string;
};

const list_connected: MyEventConnectPayload[] = [];

export const create_my_events = () => {
  // Создаем новый объект EventSource и указываем URL для подключения
  const eventSource = new EventSource("http://localhost:8000/events");

  // Обрабатываем события, когда сервер отправляет данные
  eventSource.onmessage = function (event) {
    const eventData = event.data;
    main_middleware(eventData);
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
    console.log({list_connected});
    if (list_connected.length === 1) {
      const _p = list_connected.pop();
      if (_p) {
        events_store.delete_registration_by_id(_p);
        console.log('deleted: ', _p);
      }
    }
  };
};

function parseEvent(event: any) {
  try {
    const eventJson: MyEvents = JSON.parse(event);
    if (typeof eventJson.path === "string") return eventJson;
    return null;
  } catch (err) {
    return null;
  }
}
function main_middleware(event: any) {
  const request = parseEvent(event);
  if (!request) return;

  // POST SUCCESS RESPONSE
  event_post({
    path: CLIENT_PATHS.response_ok,
    payload: {response_id: 'sdf'},
  });

  if (request.path === CLIENT_PATHS.connect_success) {
    const params = parse_my_event_connect(request);
    if (!params) return;
    list_connected.push(params.payload);
    events_store.registration_by_id(params.payload);
    event_post({
      path: PATHS_POST_EVENTS.create_room,
      payload: {
        room_ids: Object.keys(get(events_store).rooms),
        message: "text",
        registration_id: "text",
        owner_id: "id",
        user_ids: [],
      },
    });
    console.log("ConnecttikgOk: ", request);
    console.log("List: ", list_connected);
  }
}

function parse_my_event_connect(my_event: MyEvents): MyEventConnect | null {
  try {
    if (typeof my_event.payload.user_id) return my_event;
  } catch (err) {
    console.error(err);
    return null;
  }
  return null;
}
