// @ts-check
const { PATHS_POST } = require("../../../../constants");
const { shared_service } = require("../../../../shared_service");

/**
 * @typedef {Object} RegistrationRequest
 * @prop {typeof PATHS_POST['server_event_registration']} path
 * @prop {Object} body
 * @prop {string} body.cipherText
 * @prop {string} body.nonce
 * prop {import('./RegistrationBody')} body
 * @prop {string} bodySignature
 * @prop {string} pub_key_curve25519_client
 */

/**
 * @type {RegistrationRequest}
 */ // @ts-ignore
const RegistrationRequest;
// @ts-ignore
module.exports = RegistrationRequest;
