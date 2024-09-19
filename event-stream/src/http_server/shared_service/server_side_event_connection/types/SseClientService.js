// @ts-check
/**
 * @typedef {import('../add.js/types/SendJson')} SendJson
 */

/**
 * Server side event client service
 * @typedef {Object} SseClientService
 * @prop {string} connection_id
 * @prop {string|null} pub_key_client будущем будет hex_pub_key_client_id
 * @prop {SendJson} send_json
 */

/**
 * @type {SseClientService}
 */
const SseClientService;

module.exports = SseClientService;