// @ts-check

const { ERROR_TYPES } = require('../../../../validation');
const { create_empty_entity } = require('../../../../validation/create_empty_entity');

module.exports = {
  create_add,
}

/**
 * @param {import('../types/ConnectionRef')} connection_ref 
 */
function create_add(connection_ref) {
  return create_add;

  /**
   * @param {import("./types/AddParams")} p
   */
  function create_add(p) {
    return add_core({
      params: p,
      connection_ref,
    });
  }
}


/**
 * @param {import('./types/AddCoreParams')} p 
 * @returns {void}
 */
function add_core(p) {
  const { params } = p;
  const _v = validation(params);

  if (!_v.is_ok) return;

  /**
   * @type {import("../types/ServerSideEventConnectionItem")}
   */
  const new_connection_item = p.params;

  p
    .connection_ref
    .connection_by_id[params.connection_id] = new_connection_item;
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
    result.is_ok = true;
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