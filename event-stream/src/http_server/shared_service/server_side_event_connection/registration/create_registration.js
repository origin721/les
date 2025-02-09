// @ts-check

const { create_empty_entity, ERROR_TYPES } = require("../../../../validation");
const { REFS_BY_PUB_KEY_CLIENT_STATUSES } = require("../REFS_BY_PUB_KEY_CLIENT_STATUSES");

module.exports = {
  create_registration,
}

/**
 * @param {ConnectionRef} connection_ref 
 * @returns 
 */
function create_registration(connection_ref) {
  return registration;

  /**
   * @type {import("./types/Registration")}
   */
  function registration(params) {
    return registration_core({
      params,
      connection_ref,
    });
  }
}



/**
 * @param {import('./types/RegistrationCoreParams')} p 
 */
function registration_core(p) {
  const _v = validation(p);

  if (!_v.is_ok) return _v;

  const { params, connection_ref } = p;

  /**
   * @type {string}
   */
  const param_pub_key_client = params.pub_key_client;

  const sse_session = connection_ref.connection_by_id[params.connection_id];

  sse_session.pub_key_client = param_pub_key_client;

  /**
   * @type {RefsByPubKeyClient} 
   */
  const new_pub_key_client = get_new_pub_key_client(p, param_pub_key_client);
  new_pub_key_client.status = REFS_BY_PUB_KEY_CLIENT_STATUSES.ONLINE;

  connection_ref.by_pub_key_client[param_pub_key_client] = new_pub_key_client;

  return _v;
};

/**
 * @typedef {import('../types/ServerSideEventConnectionItem')} ServerSideEventConnectionItem
 */
/**
 * @typedef {import('../types/ConnectionRef')} ConnectionRef
 */

/**
 * @param {import('./types/RegistrationCoreParams')} p
 */
function validation({ params, connection_ref }) {
  /**
   * @type {import('./types/RegistrationResult')}
   */
  const _v = create_empty_entity();

  try {
    if (typeof params.pub_key_client !== 'string') {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: '.client_id не строка'
      })
      console.error(_v.err_messages.at(-1));
      return _v;
    }
    if (typeof params.connection_id !== 'string') {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: '.session_id не строка'
      })
      console.error(_v.err_messages.at(-1));
      return _v;
    }

    const sse_session = connection_ref.connection_by_id[params.connection_id];

    if (!sse_session) {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: 'Клиент не найден'
      });
      console.error(_v.err_messages.at(-1));
      return _v;
    }
    if (sse_session.pub_key_client !== null) {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: 'Клиент уже зарегестрирован'
      });
      console.error(_v.err_messages.at(-1));
      return _v;
    }

    if (!_v.err_messages.length) _v.is_ok = true;
  }
  catch (err) {
    console.error(__filename, err);
  }


  return _v;
}

/**
 * @param {import('./types/RegistrationCoreParams')} p 
 * @param {string} param_pub_key_client
 * @returns {RefsByPubKeyClient}
 */
function get_new_pub_key_client(p, param_pub_key_client) {
  const { connection_ref, params } = p;
  const existing_client = connection_ref.by_pub_key_client[param_pub_key_client]

  if (existing_client) return existing_client;
  
  return {
    pub_key_client: param_pub_key_client,
    connection_id: params.connection_id,
    status: REFS_BY_PUB_KEY_CLIENT_STATUSES.AWAITING_REGISTRATION,
  }
}

/**
 * @typedef {import('../types/RefsByPubKeyClient')} RefsByPubKeyClient 
 */