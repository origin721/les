// @ts-check

type EventPostParams = {
    message: string;
    room_id: string;
};

export function event_post(param: EventPostParams): void {
  fetch("/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Указываем, что отправляем JSON
    },
    body: JSON.stringify(param), // Преобразуем объект в строку JSON
  })
    .then((response) => response.json()) // Обрабатываем ответ как JSON
    .then((result) => {
      console.log("Success:", result);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
