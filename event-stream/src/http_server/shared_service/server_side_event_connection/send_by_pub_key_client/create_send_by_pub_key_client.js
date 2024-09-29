// @ts-check

// const { uuid } = require("../../../../libs");
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
 * @param {import('./types/SendByPubKeyClientCoreParams')} core_params 
 */
function send_by_pub_key_client_core(core_params) {
  const _v = validation(core_params.params);

  if(!_v.is_ok) return _v;

  const {params, connection_ref} = core_params;

  // const sse_session = connection_ref.connection_by_id[params.pub_key_client_receives_response];
  const request_pub_key = params.pub_key_client;
  const sse_session = connection_ref.by_pub_key_client[request_pub_key];
  if(!sse_session) {
    _v.is_ok = false;
    _v.err_messages.push({
      type: ERROR_TYPES.INVALID_PARAMS,
      message: 'пользователь не найден по публичному ключу',
    });
    return _v;
  }
  const response_session = connection_ref.connection_by_id[sse_session.connection_id];
  if(!response_session) {
    _v.is_ok = false;
    _v.err_messages.push({
      type: ERROR_TYPES.INVALID_PARAMS,
      message: 'Сессия по публичному ключу отсутствует',
    });
    return _v;
  }
  response_session.send_json(params.body);

  return _v;
  // sse_session.pub_key_client = params.pub_key_client_receives_response;

  /**
   * type {import('../types/ByResponseAwaitingItem')}
   */
  // const new_response_item = {
  //   response_id: uuid(),
  //   body: params.body,
  // }
// Есть идея создать структуру где ключи 
// клиента отправляемого через __ и получаемого клиента id
// И что бы 1 ту 1 не отправляло много данных пока клиент не получил
// Но пока будет проще
  // connection_ref.by_response_awaiting[new_response_item.response_id] = new_response_item;

  // return new Promise((res) => {
  //   const id_interval = setTimeout(() => {
  //     // if()
  //     clearInterval(id_interval);
  //   }, 1_000);
  //   res(_v)
  // });
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
    // if(typeof params.pub_key_client_receives_response !== 'string') {
    //   _v.err_messages.push({
    //     type: ERROR_TYPES.INVALID_PARAMS,
    //     message: '.pub_key_client не строка'
    //   })
    //   return _v;
    // }
    if(typeof params.pub_key_client !== 'string') {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: '.pub_key_client не строка'
      })
      return _v;
    };
    // Проверка что не упадёт;
    JSON.stringify(params.body)


    if(!_v.err_messages.length) _v.is_ok = true;
  }
  catch(err) {
    console.error(__filename, err);
  }

  return _v;
}

/**
 * @param {import('./types/SendByPubKeyClientCoreParams')} core_params 
 */
function check_is_exist_client_session(core_params) {
  const {
    // params: {pub_key_client_receives_response},
    connection_ref
  } = core_params;

  // return !!connection_ref[pub_key_client_receives_response];
}