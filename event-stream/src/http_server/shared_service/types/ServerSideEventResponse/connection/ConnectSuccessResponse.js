// @ts-check
const {CLIENT_PATHS} = require('../../../../constants');
/**
 * @typedef {Object} ConnectSuccessResponse
 * @prop {keyof CLIENT_PATHS['connect_success']} path
 * @prop {import("./ConnectSuccessResponseBody")} body
 * @prop {Date} created_date
 * @prop {string} response_id
 * @prop {number} active_users
 */

/**
 * @type {ConnectSuccessResponse}
 */
const ConnectSuccessResponse;

module.exports = ConnectSuccessResponse;