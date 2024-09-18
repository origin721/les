// @ts-check
/**
 * @typedef {import('../http_server/shared_service/server_side_event_connection/add.js/types/SendJsonDtoParams')} SendJsonDtoParams
 */


/**
 * @typedef {Object} EnsureResponseReadonly
 * @prop {string} request_id  
 * @prop {Readonly<SendJsonDtoParams>} send_params
 * @prop {() => void} clear
 */

/**
 * @type {EnsureResponseReadonly}
 */
const EnsureResponseReadonly;

module.exports = EnsureResponseReadonly;