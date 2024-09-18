// @ts-check

module.exports = {
  create_get_by_id,
}

/**
 * 
 * @param {ServerSideEventConnectionRecord} record 
 * @returns 
 */
function create_get_by_id(record) {
  return get_by_id;

  /**
   * @type {import("./ServerSideEventConnectionGetById")}
   */
  function get_by_id(connection_id) {
    return get_by_id_core({ connection_id, record });
  }
}




/**
 * @typedef {Object} GetByIdCoreParams
 * @prop {ServerSideEventConnectionRecord} record
 * @prop {ServerSideEventConnectionItem['connection_id']} connection_id
 */
/**
 * @param {GetByIdCoreParams} p 
 * @returns {null | ServerSideEventConnectionItem}
 */
function get_by_id_core(p) {
  return p.record[p.connection_id]
};

/**
 * @typedef {import('./ServerSideEventConnectionItem')} ServerSideEventConnectionItem
 */
/**
 * @typedef {import('./ServerSideEventConnectionRecord')} ServerSideEventConnectionRecord
 */