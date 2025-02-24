// @ts-check
const { PATHS_POST } = require("../../constants");
const { check_validation, jsonParse } = require("../../../core");
const { create_empty_entity, ERROR_TYPES } = require("../../../validation");
const { registration } = require("../services");
const { shared_service } = require("../../shared_service/");
const { send_by_pub_key } = require("../services/send_by_pub_key/send_by_pub_key");
const { encrypt_curve25519_verify } = require("../../../core/crypt/libsodium-wrappers/encrypt_curve25519_verify");
const { decrypt_curve25519_verify } = require("../../../core/crypt/libsodium-wrappers/decrypt_curve25519_verify");
const { get_back_keys } = require("../../../core/crypt/get_back_keys");

module.exports = { events_post_middleware };

/**
 * @typedef {import('../types/EventsReqBody')} EventsReqBody
 */

/**
 * @param {import('./types/EventsPostMiddlewareParams')} params
 */
async function events_post_middleware(params) {
  const _v = events_post_middleware_validation(params.body);
  const { http_params } = params;

  if (!_v.is_ok) {
    http_params.res.writeHead(400);
    http_params.res.end("400 Bad Request");

    return;
  }

  const secret_config = await get_back_keys();

  /**
   * @type {import("../services/registration/registration").PayloadRequest}
   */
  const payloadRequest = jsonParse(await decrypt_curve25519_verify({
    receiverPrivateKey: secret_config.privateKeyCurve25519,
    senderPublicKey: params.body.pub_key_curve25519_client,
    cipherText: params.body.payloadSignature.cipherText, 
    nonce: params.body.payloadSignature.nonce,
  }));

  const payload_v = payload_validation(payloadRequest);

  if (!payload_v.is_ok) {
    http_params.res.writeHead(400);
    http_params.res.end("400 Bad Request");

    return;
  }


  switch (payloadRequest.path) {
    case PATHS_POST.server_event_registration: {
      registration(params, payloadRequest);
      break;
    }
    case PATHS_POST.send_by_pub_key: {
      // TODO: код не правильный потом дописать
      send_by_pub_key(http_params, shared_service, payloadRequest);
      break;
    }
    // case PATHS_POST.create_room: {
    //   // TODO: перебирать в массиве
    //   params.app_ref.rooms_by_id[params.body.payload.room_id] = params.body.payload;
    //   console.log('add room: ', params.app_ref.rooms_by_id);
    //   params.httpParams.res.writeHead(201);
    //   params.httpParams.res.write("");
    // }
    //   break;
    default:
      params.http_params.res.writeHead(404);
      params.http_params.res.write("");
  }
  return;
}

function payload_validation(payload) {
  const _v = create_empty_entity();
  try {
    if (typeof payload.path !== "string") {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: "payload.path required",
      });
    }
    if (!_v.err_messages.length) _v.is_ok = true;
  } catch (err) {
    console.error("POST: ", { payload, _v });
  }

  return _v;
}


function events_post_middleware_validation(body) {
  const _v = create_empty_entity();
  try {
    if (typeof body.payloadSignature.nonce !== "string") {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: ".payloadSignature.nonce required",
      });
    }
    if (typeof body.payloadSignature.cipherText !== "string") {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: ".payloadSignature.cipherText required",
      });
    }
    if (typeof body.pub_key_curve25519_client !== "string") {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: ".pub_key_curve25519_client required",
      });
    }
    if (!_v.err_messages.length) _v.is_ok = true;
  } catch (err) {
    console.error("POST: ", { body, _v });
  }

  return _v;
}
