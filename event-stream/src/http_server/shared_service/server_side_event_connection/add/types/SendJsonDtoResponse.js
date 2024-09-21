// @ts-check
/**
 * @typedef {import('../../../../../types/post_body_payloads/AllClientPayloads')} AllClientPayloads
 */

/**
 * @typedef {Object} SendJsonDtoResponse
 * @prop {keyof typeof CLIENT_PATHS} path
 * @prop {AllClientPayloads} payload
 * @prop {number} active_users
 */


/**
 * @type {SendJsonDtoResponse}
 */
const SendJsonDtoResponse;

module.exports = SendJsonDtoResponse;