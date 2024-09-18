// @ts-check

module.exports = {
  create_get_by_id,
}

/**
 * @param {ConnectionRef} connection_ref 
 * @returns 
 */
function create_get_by_id(connection_ref) {
  return get_by_id;

  /**
   * @type {import("./types/ServerSideEventConnectionGetById")}
   */
  function get_by_id(connection_id) {
    return get_by_id_core({
      connection_id,
      connection_ref,
    });
  }
}




/**
 * @typedef {Object} GetByIdCoreParams
 * @prop {ConnectionRef} connection_ref
 * @prop {ServerSideEventConnectionItem['connection_id']} connection_id
 */
/**
 * @param {GetByIdCoreParams} p 
 * @returns {null | ServerSideEventConnectionItem}
 */
function get_by_id_core(p) {
  return p.connection_ref.connection_by_id[p.connection_id]
};

/**
 * @typedef {import('../types/ServerSideEventConnectionItem')} ServerSideEventConnectionItem
 */
/**
 * @typedef {import('../types/ConnectionRef')} ConnectionRef
 */
/**
 * @typedef {import('./types/ServerSideEventConnectionRecordById')} ServerSideEventConnectionRecordById
 */