// @ts-check

const { get_back_keys } = require("../../../../core/crypt/get_back_keys");
const { decrypt_curve25519_verify } = require("../../../../core/crypt/libsodium-wrappers/decrypt_curve25519_verify");
const { encrypt_curve25519_verify } = require("../../../../core/crypt/libsodium-wrappers/encrypt_curve25519_verify");
const { create_empty_entity, ERROR_TYPES } = require("../../../../validation");
const { PATHS_POST } = require("../../../constants");


module.exports = { registration }


/**
 * @param {import("../../middleware/types/EventsPostMiddlewareParams")} params
 * @param {PayloadRequest} payloadRequest
 * @returns {Promise<void>}
 */
async function registration(
  {
    http_params,
    shared_service,
    body,
  },
  payloadRequest,
) {
  try {
    const backKeys = await get_back_keys();

    const _v = validation(payloadRequest);
    if (!_v.is_ok) {
      http_params.res.writeHead(400);
      http_params.res.write("invalid params");

      return;
    }

    const service_v = shared_service.registration({
      connection_id: payloadRequest.body.connection_id,
      pub_key_client: body.pub_key_curve25519_client,
    });

    if(service_v.is_ok) {
      http_params.res.writeHead(201);
      http_params.res.write("ok");
    }
    else {
      http_params.res.writeHead(400);
      http_params.res.write("Bed request");
    }
  }
  catch(err) {
      http_params.res.writeHead(400);
      http_params.res.write("Bed request");
  }
};

/**
 * 
 * @param {PayloadRequest} payloadRequest
 */
function validation(payloadRequest) {
  const _v = create_empty_entity();
  try {
    if (payloadRequest.path !== PATHS_POST.server_event_registration) {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: `.path ${PATHS_POST.server_event_registration} !== ${payloadRequest.path}`
      })
      console.error(_v.err_messages.at(-1));
    };
   //if (typeof body.body.connection_id !== 'string') {
   //  _v.err_messages.push({
   //    type: ERROR_TYPES.INVALID_PARAMS,
   //    message: '.connection_id обязательный'
   //  })
   //  console.error(_v.err_messages.at(-1));
   //};
    if (typeof payloadRequest.body.pub_key_ed25519_client !== 'string') {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: '.pub_key_ed25519_client обязательный'
      })
      console.error(_v.err_messages.at(-1));
    };
    if (typeof payloadRequest.body.connection_id !== 'string') {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: '.connection_id обязательный'
      })
      console.error(_v.err_messages.at(-1));
    };

    if (!_v.err_messages.length) _v.is_ok = true;
  }
  catch (err) {
    console.error(__filename, err);
  }
  console.log('Ошибка регистрации: ', _v);
  return _v;
}


/**
 * @typedef {Object} PayloadRequest
 * @prop {string} path
 * @prop {string} uuid
 * @prop {Date} created_date
 * @prop {Object} body
 * @prop {string} body.connection_id
 * @prop {string} body.pub_key_ed25519_client
 */