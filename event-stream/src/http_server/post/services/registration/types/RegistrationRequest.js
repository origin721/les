// @ts-check
const { PATHS_POST } = require("../../../../constants");

/**
 * @typedef {Object} RegistrationRequest
 * @prop {typeof PATHS_POST['server_event_registration']} path
 * @prop {import('./RegistrationBody')} body
 */

/**
 * @type {RegistrationRequest}
 */
const RegistrationRequest;

module.exports = RegistrationRequest;

