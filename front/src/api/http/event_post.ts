// @ts-check

import { uuidv4 } from "../../core/uuid";
import { encrypt_curve25519, encrypt_curve25519_verify } from "../../core/crypt";
import { PATHS_POST } from "./constants";
import { forceLog } from "../../core/debug/logger";


export type EventServerSendByPubKey = {
  path: typeof PATHS_POST['send_by_pub_key'];
  body: {
    pub_key_client: string;
    message: string;
  }
}
type EventServerRegistration = {
  path: typeof PATHS_POST['server_event_registration'];
  body: {
    connection_id: string;
  }
}

type EventServerParam = 
  | EventServerSendByPubKey
  | EventServerRegistration;



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
export type SecureParam = SecureParamComm|SecureParamReg;

export async function event_post<T>(
  params: EventServerParam,
  secureParam: SecureParam,
): Promise<T> {
  let _body;
  if(params.path === PATHS_POST.server_event_registration) {
    const _secureParam: SecureParamReg = secureParam as any;
    const payload = JSON.stringify({
      path: params.path,
      uuid: uuidv4(),
      created_date: new Date(),
      body: {
        connection_id: params.body.connection_id,
        pub_key_ed25519_client: _secureParam.pub_key_ed25519_client,
      }
    })
    _body = await encrypt_curve25519({
      receiverPublicKey: _secureParam.pub_key_curve25519_server,
      message: JSON.stringify({
        payloadSignature: await encrypt_curve25519_verify({
          receiverPublicKey: _secureParam.pub_key_curve25519_server,
          senderPrivateKey: _secureParam.priv_key_curve25519_client,
          message: payload
        }),
        pub_key_curve25519_client: _secureParam.pub_key_curve25519_client,
      })
    });
   }
   else if(params.path === PATHS_POST.send_by_pub_key) {
    const _secureParam: SecureParamReg = secureParam as any;
    const payload = JSON.stringify({
      path: params.path,
      uuid: uuidv4(),
      created_date: new Date(),
      body: params.body,
    })
    _body = await encrypt_curve25519({
      receiverPublicKey: _secureParam.pub_key_curve25519_server,
      message: JSON.stringify({
        payloadSignature: await encrypt_curve25519_verify({
          receiverPublicKey: _secureParam.pub_key_curve25519_server,
          senderPrivateKey: _secureParam.priv_key_curve25519_client,
          message: payload
        }),
        pub_key_curve25519_client: _secureParam.pub_key_curve25519_client,
      })
    })
  }
  else {
     forceLog('КРИТИЧЕСКАЯ ОШИБКА API: не существует метода для запроса', params);
   }

  return fetch("/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Указываем, что отправляем JSON
    },
    body: _body,
  }) as Promise<T>
//   .then((response) => response.json()) // Обрабатываем ответ как JSON
//   .then((result) => {
//     console.log("Success:", result);
//     return result;
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//     return null;
//   });
}
