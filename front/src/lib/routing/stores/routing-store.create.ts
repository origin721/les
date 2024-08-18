import { get, writable } from "svelte/store";

export const createRoutingStore = () => {
  const store = writable(getInitialValue());

  function setPath(newPathString: string) {
    // Создаем объект состояния, который будет сохранен в истории
    const state = { additionalInformation: "Some data" };

    // Новый URL, который нужно установить
    const title = ""; // Вы можете установить заголовок страницы, если нужно
    const url = newPathString;

    // Изменяем URL и добавляем новое состояние в историю браузера
    history.pushState(state, title, url);

    store.set(getInitialValue());

  }

  function getJson() {
    try {
      const currentStore = get(store);
      return JSON.stringify(currentStore);
    }
    finally {
      return null;
    }
  };

  return {
    subscribe: store.subscribe,
    setPath,
    getJson,
  };
};

function getInitialValue() {
  return {
    pathname: location.pathname,
  };
}
