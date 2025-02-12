// @ts-check

const { get_back_keys } = require("../../../../core/crypt/get_back_keys");
const { decrypt_curve25519_verify } = require("../../../../core/crypt/libsodium-wrappers/decrypt_curve25519_verify");
const { encrypt_curve25519_verify } = require("../../../../core/crypt/libsodium-wrappers/encrypt_curve25519_verify");
const { create_empty_entity, ERROR_TYPES } = require("../../../../validation");
const { PATHS_POST } = require("../../../constants");


module.exports = { registration }


/**
 * @param {import("../../middleware/types/EventsPostMiddlewareParams")} params
 * @returns {Promise<void>}
 */
async function registration({ http_params, body: _body, shared_service }) {
  try {
    /** @type {import('./types/RegistrationRequest')} */
    const body = _body;
    const backKeys = await get_back_keys();
    /**
     * @type {import('./types/RegistrationBody')}
     */
    const encryptedBody = JSON.parse(
      await decrypt_curve25519_verify({
        receiverPrivateKey: backKeys.privateKeyCurve25519,
        senderPublicKey: body.pub_key_curve25519_client,
        cipherText: body.body.cipherText,
        nonce: body.body.nonce,
      })
    );
    // TODO: недописал регистрацию
    console.log({encryptedBody});
    const _v = validation(encryptedBody);
    if (!_v.is_ok) {
      http_params.res.writeHead(400);
      http_params.res.write("invalid params");

      return;
    }

    const service_v = shared_service.registration({
      connection_id: body.body.connection_id,
      pub_key_client: body.body.pub_key_client,
    });

    if(service_v.is_ok) {
      http_params.res.writeHead(201);
      http_params.res.write("");
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
 * @param {import('./types/RegistrationRequest')} body 
 * @param {import('./types/RegistrationBody')} bodyEncrtypted
 * @returns 
 */
function validation(body) {
  const _v = create_empty_entity();
  try {
    if (body.path === PATHS_POST.server_event_registration) {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: `.path ${PATHS_POST.server_event_registration} !== ${body.path}`
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
    if (typeof body.body.pub_key_client !== 'string') {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: '.pub_key_client обязательный'
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
