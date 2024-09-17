// @ts-check
/**
 * @typedef {import('./SendJsonDtoParams')} SendJsonDtoParams
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