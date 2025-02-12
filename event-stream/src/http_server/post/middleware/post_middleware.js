// @ts-check

import { get_request_body } from "../../../core/get_request_body.js";
import { get_back_keys } from "../../../core/crypt/get_back_keys.js";
import { decrypt_curve25519 } from "../../../core/crypt/libsodium-wrappers/decrypt_curve25519.js";
import { events_post_middleware } from "./events_post_middleware.js";
import { jsonParse } from "../../../core/jsonParse.js";

/**
 * @typedef {import('./types/PostMiddleware')} PostMiddleware
 */


/**
 * 
 * @param {PostMiddleware} httpParams 
 */
export function post_middleware({http_params: http_params, shared_service}) {
  return get_request_body(http_params.req).then(async (body) => {
    const secret_config = await get_back_keys();
    const _body = await decrypt_curve25519({
      receiverPrivateKey: secret_config.privateKeyCurve25519,
      cipherText: body,
      receiverPublicKey: secret_config.publicKeyCurve25519,
    });

    if(_body === null) throw new Error('Body не удалось расшифровать');

    events_post_middleware({
      body: jsonParse(_body),
      http_params,
      shared_service,
    });
  }).catch(err => {
    http_params.res.writeHead(500);
    http_params.res.end();
  });
}
