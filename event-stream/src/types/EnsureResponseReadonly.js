// @ts-check
/**
 * @typedef {import('../http_server/shared_service/types/SendJsonDtoParams/SendJsonDtoParams')} SendJsonDtoParams
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