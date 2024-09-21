// @ts-check

const { ERROR_TYPES } = require('../../../../validation');
const { create_safe_result } = require('../../../../validation/create_safe_result');

module.exports = {
  create_remove_client_by_id,
};

/**
 * // TODO: доделать удаление
 * @param {import('../types/ConnectionRef')} connection_ref 
 */
function create_remove_client_by_id(connection_ref) {
  return remove_client_by_id;

  /**
   * @param {import("./types/RemoveClientByIdParams")} p
   */
  function remove_client_by_id(p) {
    return remove_client_by_id_core({
      params: p,
      connection_ref,
    });
  }
}


/**
 * @param {import('./types/RemoveClientByIdCoreParams')} p
 */
function remove_client_by_id_core(p) {
  const { params } = p;
  const { http_params } = params;
};


/**
 * @typedef {import('../../../../validation/types/SafeResult').SafeResult<null>} ValidationResult
 */

/**
 * @typedef {import('../../../../validation/types/ErrorEntity')} ErrorEntity
 */