// @ts-check

import { encrypt_curve25519, encrypt_curve25519_verify } from "../../crypt";
import { PATHS_POST } from "./constants";

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

type EventServerEventRegistration = {
  path: typeof PATHS_POST['server_event_registration'];
  body: {
    connection_id: string;
  }
}
PATHS_POST.server_event_registration;

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

/**
 * Для регистрации не нужн приватный ключ для подписи
 * Нужен публичный ключ подписи
 */
type SecureParamReg = {
  pub_key_curve25519_client: string,
  priv_key_curve25519_client: string,
  pub_key_ed25519_client: string,
  pub_key_curve25519_server: string,
};
/**
 * Обычный запрос нужен ключ подписи
 */
type SecureParamComm = {
  pub_key_curve25519_client: string,
  priv_key_curve25519_client: string,
  priv_key_ed25519_client: string,
  pub_key_curve25519_server: string,
};
type SecureParam = SecureParamComm|SecureParamReg;

export async function event_post<T>(
  params: EventServerEventRegistration,
  secureParam: SecureParam,
): Promise<T> {
  let _body;
  if(params.path === PATHS_POST.server_event_registration) {
    const _secureParam: SecureParamReg = secureParam as any;
    const payload = JSON.stringify({
      connection_id: params.body.connection_id,
      pub_key_ed25519_client: _secureParam.pub_key_ed25519_client,
      created_date: new Date(),
    })
    _body = await encrypt_curve25519({
      receiverPublicKey: _secureParam.pub_key_curve25519_server,
      message: JSON.stringify({
        path: params.path,
        body: payload,
        bodySignature: await encrypt_curve25519_verify({
          receiverPublicKey: _secureParam.pub_key_curve25519_server,
          senderPrivateKey: _secureParam.priv_key_curve25519_client,
          message: payload
        }),
        pub_key_curve25519_client: _secureParam.pub_key_curve25519_client,
      })
    });
  }
  else {
    console.error('не существует метода');
  }

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
