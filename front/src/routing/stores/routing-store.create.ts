import { get, writable } from "svelte/store";

export const createRoutingStore = () => {
  const store = writable(getInitialValue());

  function setRoute(param: {
    hash: string;
    queryParams?: Record<string, string>;
  }) {
    // Создаем объект состояния, который будет сохранен в истории
    const state = { };

    // Новый URL, который нужно установить
    const title = ""; // Вы можете установить заголовок страницы, если нужно
    // const url = '/sss.page?aaa=ccc#section';
    //const url = newPathString;

    setQueryParam(
      param.queryParams 
        ? Object.entries(param.queryParams)
        : []
    );
 

    // Изменяем URL и добавляем новое состояние в историю браузера
    //history.pushState(state, title, url);

    window.location.hash = (
      (
        typeof param.hash === 'string'
        && param.hash[0] === '#'
      )
        ? param.hash
        : `#${param.hash}`
    );

    store.set(getInitialValue());
  }

  window.addEventListener('popstate', (event) => {
    store.set(getInitialValue());
  });

  function setPath(newPathString: string) {
    // Создаем объект состояния, который будет сохранен в истории
    const state = {};

    // Новый URL, который нужно установить
    const title = ""; // Вы можете установить заголовок страницы, если нужно
    // const url = '/sss.page?aaa=ccc#section';
    const url = newPathString;


    // Изменяем URL и добавляем новое состояние в историю браузера
    history.pushState(state, title, url);

    store.set(getInitialValue());

  }

  window.addEventListener('popstate', (event) => {
    store.set(getInitialValue());
  });

  return {
    subscribe: store.subscribe,
    setRoute,
    setPath,
  };
};

function getInitialValue() {
  const queryParams = new URLSearchParams(location.search);
  // const startIndex = url.indexOf('?') + 1; // Индекс символа после "."
  // const endIndex = url.indexOf('#') !== -1 ? url.indexOf('#') : url.length; // Индекс "#", если он существует

  // const queryParamString = url.slice(startIndex, endIndex); // Получаем строку от точки до #
  // console.log(queryParamString); // "page?aaa=ccc#jksdf" -> "aaa=ccc"
  // const queryParams = new URLSearchParams(queryParamString);
  // const value = queryParams.get('aaa');

  return {
    pathname: location.hash.slice(1),
    queryParams,
  };
}

export function setQueryParam(
  pathParams: NewQueryParams
) {
  const url = new URL(location.href);
  pathParams.forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  window.history.replaceState({}, "", url.toString());
}

type NewQueryParams = Array<[string, string]>;