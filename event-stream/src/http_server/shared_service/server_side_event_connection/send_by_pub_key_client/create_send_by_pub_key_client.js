// @ts-check

const { create_empty_entity, ERROR_TYPES } = require("../../../../validation");

module.exports = {
  create_send_by_pub_key_client,
}

/**
 * @param {ConnectionRef} connection_ref 
 * @returns 
 */
function create_send_by_pub_key_client(connection_ref) {
  return send_by_client_id;

  /**
   * @type {import("./types/SendByPubKeyClient")}
   */
  function send_by_client_id(params) {
    return send_by_pub_key_client_core({
      params,
      connection_ref,
    });
  }
}



/**
 * @param {import('./types/SendByPubKeyClientCoreParams')} p 
 */
function send_by_pub_key_client_core(p) {
  const _v = validation(p.params);

  if(!_v.is_ok) return Promise.resolve(_v);

  const {params, connection_ref} = p;

  const sse_session = connection_ref.connection_by_id[params.pub_key_client];

  sse_session.pub_key_client = params.pub_key_client;

  return new Promise((res) => {
    res(_v)
  });
};

/**
 * @typedef {import('../types/ServerSideEventConnectionItem')} ServerSideEventConnectionItem
 */
/**
 * @typedef {import('../types/ConnectionRef')} ConnectionRef
 */

/**
 * @param {import('./types/SendByPubKeyClientParams')} params
 */
function validation(params) {
  const _v = create_empty_entity();

  try {
    if(typeof params.pub_key_client !== 'string') {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: '.pub_key_client не строка'
      })
      return _v;
    }

    if(!_v.err_messages.length) _v.is_ok = true;
  }
  catch(err) {
    console.error(__filename, err);
  }

  
  return _v;
}