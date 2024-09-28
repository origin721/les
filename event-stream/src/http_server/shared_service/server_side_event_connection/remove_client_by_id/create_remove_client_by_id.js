// @ts-check

const { ERROR_TYPES } = require('../../../../validation');
const { create_safe_result } = require('../../../../validation/create_safe_result');

module.exports = {
  create_remove_client_by_id,
};

/**
 * RemoveClientById
 * @typedef {(p: import('./types/RemoveClientByIdCoreParams')) => ReturnType<typeof remove_client_by_id_core>} RemoveClientById
 */

/**
 * // TODO: доделать удаление
 * @param {import('../types/ConnectionRef')} connection_ref 
 */
function create_remove_client_by_id(connection_ref) {
  return remove_client_by_id;

  /**
   * @type {RemoveClientById}
   */
  function remove_client_by_id(p) {
    return remove_client_by_id_core(p,connection_ref);
  }
}


/**
 * @param {import('./types/RemoveClientByIdCoreParams')} params
 * @param {import('../types/ConnectionRef')} connection_ref 
 */
function remove_client_by_id_core(params, connection_ref) {
  const { connection_id } = params;

  const removedItem = connection_ref.connection_by_id[connection_id];
  // TODO: сценарий с тем что публичный ключ больше не нужен
  if(removedItem.pub_key_client) {
    connection_ref.by_pub_key_client[removedItem.pub_key_client];
  }
  delete connection_ref.connection_by_id[connection_id];

};


/**
 * @typedef {import('../../../../validation/types/SafeResult').SafeResult<null>} ValidationResult
 */

/**
 * @typedef {import('../../../../validation/types/ErrorEntity')} ErrorEntity
 */