// @ts-check
const { PATHS_POST } = require("../../../../constants");
const { shared_service } = require("../../../../shared_service");

/**
 * @typedef {Object} RegistrationRequest
 * @prop {typeof PATHS_POST['server_event_registration']} path
 * @prop {import('./RegistrationBody')} body
 * @prop {typeof shared_service} shared_service
 */

/**
 * @type {RegistrationRequest}
 */ // @ts-ignore
const RegistrationRequest;
// @ts-ignore
module.exports = RegistrationRequest;
