// @ts-check

const { ERROR_TYPES } = require('../../../../validation');
const { create_safe_result: create_empty_entity } = require('../../../../validation/create_safe_result');
const { create_new_connection } = require('../send_by_pub_key_client/create_new_connection');

module.exports = {
  create_add,
}

/**
 * @param {import('../types/ConnectionRef')} connection_ref 
 */
function create_add(connection_ref) {
  return _add;

  /**
   * @param {import("./types/AddParams")} p
   */
  function _add(p) {
    return add_core({
      params: p,
      connection_ref,
    });
  }
}

/**
 * @typedef {Object} AddCoreResult
 * @prop {string} connection_id
 */

/**
 * @param {import('./types/AddCoreParams')} p
 * @returns {AddCoreResult}
 */
function add_core(p) {
  const { params } = p;
  const { http_params } = params;
  // const _v = validation(params);

  // if (!_v.is_ok) return _v;

  /**
   * @type {import("../types/SseClientService")}
   */
  const new_connection_item = create_new_connection(http_params);

  p
    .connection_ref
    .connection_by_id[new_connection_item.connection_id] = new_connection_item;

    new_connection_item.send_json({hi:'ok'})


  /**
   * @type AddCoreResult
   */
  const result = {
    connection_id: new_connection_item.connection_id
  }

  return result;
};

/**
 * @param {import('./types/AddParams')} params
 * @returns {ValidationResult}
 */
function validation(params) {
  /**
   * @type {ValidationResult}
   */
  const result = create_empty_entity();

  try {
    if (typeof params.connection_id !== 'string') {
      /**
       * @type {ErrorEntity}
       */
      const _err = {
        type: ERROR_TYPES.INVALID_PARAMS,
        message: '.connection_id обязательный для добавления'
      }
      result.err_messages.push(_err);
    };

    if (result.err_messages.length !== 0) {
      result.is_ok = true;
    }
  }
  catch (err) {

  }

  return result;
}

/**
 * @typedef {import('../../../../validation/types/SafeResult').SafeResult<null>} ValidationResult
 */

/**
 * @typedef {import('../../../../validation/types/ErrorEntity')} ErrorEntity
 */