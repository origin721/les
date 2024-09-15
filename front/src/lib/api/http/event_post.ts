// @ts-check

type EventPostParams = {
  message: string;
  room_id: string;
  registration_id: string;
  owner_id: string;
  user_ids: string[];
};

type EventPostParamsDto = {
  path: keyof typeof PATHS_POST_EVENTS;
  params: EventPostParams & {
    created_date: Date;
  };
};

const PATHS_POST_EVENTS = {
  create_room: "create_room",
} as const;

export function event_post(params: EventPostParams): void {
  const _body: EventPostParamsDto = {
    path: PATHS_POST_EVENTS.create_room,
    params: {
      ...params,
      created_date: new Date(),
    },
  };

  fetch("/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Указываем, что отправляем JSON
    },
    body: JSON.stringify(_body), // Преобразуем объект в строку JSON
  })
    .then((response) => response.json()) // Обрабатываем ответ как JSON
    .then((result) => {
      console.log("Success:", result);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
