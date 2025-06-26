import { get, writable } from "svelte/store";

export const createRoutingStore = () => {
  const store = writable(getInitialValue());

  function setPath(newPathString: string) {
    // Создаем объект состояния, который будет сохранен в истории
    const state = {};

    // Новый URL, который нужно установить
    const title = ""; // Вы можете установить заголовок страницы, если нужно
    // const url = '/sss.page?aaa=ccc#section';
    const url = newPathString;

    // Изменяем URL и добавляем новое состояние в историю браузера
    if (typeof window !== "undefined") {
      history.pushState(state, title, url);
    }

    store.set(getInitialValue());
  }

  if (typeof window !== "undefined") {
    window.addEventListener("popstate", (event) => {
      store.set(getInitialValue());
    });
  }

  return {
    subscribe: store.subscribe,
    setPath,
  };
};

function getInitialValue() {
  if (typeof window === "undefined") {
    return {
      pathname: "/",
      queryParams: new URLSearchParams(),
    };
  }
  const queryParams = new URLSearchParams(location.search);
  // const startIndex = url.indexOf('?') + 1; // Индекс символа после "."
  // const endIndex = url.indexOf('#') !== -1 ? url.indexOf('#') : url.length; // Индекс "#", если он существует

  // const queryParamString = url.slice(startIndex, endIndex); // Получаем строку от точки до #
  // console.log(queryParamString); // "page?aaa=ccc#jksdf" -> "aaa=ccc"
  // const queryParams = new URLSearchParams(queryParamString);
  // const value = queryParams.get('aaa');

  return {
    pathname: location.pathname,
    queryParams,
  };
}
