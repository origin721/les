// @ts-check

type EventPostParamsPayload = {
  message: string;
  room_ids: string[];
  registration_id: string;
  owner_id: string;
  user_ids: string[];
};

type ResponseOkPayload = {
  response_id: string;
}

type EventPostParams = {
  payload: ResponseOkPayload|EventPostParamsPayload;
  path: keyof typeof PATHS_POST_EVENTS;
};

type EventPostParamsDto = {
  path: keyof typeof PATHS_POST_EVENTS;
  params: {
    created_date: Date;
  };
  payload: EventPostParams["payload"];
};

export const PATHS_POST_EVENTS = {
  create_room: "create_room",
  ping: "ping",
  response_ok: 'response_ok',
} as const;

export function event_post<T>(
  params: EventPostParams,
): Promise<T> {
  const _body: EventPostParamsDto = {
    path: params.path,
    payload: params.payload,
    params: {
      created_date: new Date(),
    },
  };

  return fetch("/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Указываем, что отправляем JSON
    },
    body: JSON.stringify(_body), // Преобразуем объект в строку JSON
  })
    .then((response) => response.json()) // Обрабатываем ответ как JSON
    .then((result) => {
      console.log("Success:", result);
      return result;
    })
    .catch((error) => {
      console.error("Error:", error);
      return null;
    });
}
