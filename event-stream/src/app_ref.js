// @ts-check

/**
 * @typedef {import('./types/EnsureResponseReadonly')} EnsureResponseReadonly
 */
/**
 * @typedef {import('./types/RoomData')} RoomData
 */
/**
 * @typedef {import('./types/ClientData')} ClientData
 */


/**
 * @type {Record<string, RoomData>}
 */
const rooms_by_id = {};


/**
 * @type {Record<string, EnsureResponseReadonly>}
 */
const ensure_response = {};


/**
 * @type {Record<string, ClientData>}
 */
const clients_by_id = {};


/**
 * @typedef {Object} AppRef
 * @prop {typeof ensure_response} ensure_response
 * @prop {typeof rooms_by_id} rooms_by_id
 * @prop {typeof clients_by_id} clients_by_id
 */
/**
 * @type {AppRef}
 */
const app_ref = {
  rooms_by_id,
  ensure_response,
  clients_by_id,
};

module.exports = app_ref;