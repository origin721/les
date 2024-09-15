import { get } from "svelte/store";
import { event_post } from "../../api/http/event_post";
import { events_store } from "./events_store";

type MyEvents = MyEventConnect;
const CLIENT_PATHS = Object.freeze({
  connect_success: "connect_success",
  ping: "ping",
});
type MyEventConnect = {
  path: (typeof CLIENT_PATHS)["connect_success"];
  /**
   * @prop {string} user_id это id сгенерировано сервером
   * для клиента, сам клиент не мог его сгенерировать, клиенту не терять
   * так как повторно не высылается
   */
  payload: {
    user_id: string;
  };
};

export const create_my_events = () => {
  // Создаем новый объект EventSource и указываем URL для подключения
  const eventSource = new EventSource("http://localhost:8000/events");

  // Обрабатываем события, когда сервер отправляет данные
  eventSource.onmessage = function (event) {
    const eventData = event.data;
    main_middleware(eventData);
    // console.log(eventData);
    // Выводим полученные данные на страницу
    //  document.getElementById('events').innerHTML += `<p>${eventData}</p>`;
  };

  // Обрабатываем ошибки
  eventSource.onerror = function (event) {
    // TODO: доработать в интерфейс
    console.error("EventSource failed:", event);
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
  if(!request) return;

  if(request.path === CLIENT_PATHS.connect_success) {
    const params = parse_my_event_connect(request);
    if(!params) return;
    events_store.registration_by_id(params.payload);
    event_post({
        room_ids: get(events_store),
        message: 'text',
        registration_id: 'text',
        owner_id: 'id',
        user_ids: [],
    });
    console.log('ConnecttikgOk: ', request);
  }
}

function parse_my_event_connect(my_event: MyEvents): MyEventConnect | null {
    try {
        if(typeof my_event.payload.user_id) return my_event;
    }
    catch(err) {
        console.error(err);
        return null;
    }
    return null;
}