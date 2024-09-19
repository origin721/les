// @ts-check

/**
 * @typedef {import('../../types/EnsureResponseReadonly')} EnsureResponseReadonly
 */
/**
 * @typedef {import('../../types/RoomData')} RoomData
 */
/**
 * @typedef {import('./server_side_event_connection/types/SseClientService')} ClientData
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
const clients_session_by_id = {};


/**
 * @typedef {Object} AppRef
 * @prop {typeof ensure_response} ensure_response
 * @prop {typeof rooms_by_id} rooms_by_id
 * @prop {typeof clients_session_by_id} clients_session_by_id
 */
/**
 * @type {AppRef}
 * @deprecated
 */
const app_ref = {
  rooms_by_id,
  ensure_response,
  clients_session_by_id,
};

module.exports = app_ref;