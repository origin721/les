// @ts-check

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
   * @type {import("./types/RegistrationParams")}
   */
  function registration(connection_id) {
    return registration_core({
      connection_id,
      connection_ref,
    });
  }
}



/**
 * @param {import('./types/RegistrationCoreParams')} p 
 */
function registration_core(p) {
  p.connection_ref.connection_by_id[p.connection_id]
};

/**
 * @typedef {import('../types/ServerSideEventConnectionItem')} ServerSideEventConnectionItem
 */
/**
 * @typedef {import('../types/ConnectionRef')} ConnectionRef
 */
