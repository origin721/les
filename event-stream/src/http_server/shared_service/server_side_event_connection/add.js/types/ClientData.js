// @ts-check
/**
 * @typedef {import('./SendJson')} SendJson
 */

/**
 * @typedef {Object} ClientData
 * @prop {string} session_id
 * @prop {string|null} client_id будущем будет hex_pub_key_client_id
 * @prop {SendJson} send_json
 */

/**
 * @type {ClientData}
 */
const ClientData;

module.exports = ClientData;