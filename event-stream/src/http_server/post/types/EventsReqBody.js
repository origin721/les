// @ts-check

const { PATHS_POST } = require("../../constants");


/**
 * @typedef {Object} CommonEventReq
 * @prop {typeof PATHS_POST['server_event_registration']} path
 * 
 * @typedef {Object} EventsReqBody
 * @prop {string} pub_key_curve25519_client
 * @prop {Object} payloadSignature
 * @prop {string} payloadSignature.cipherText
 * @prop {string} payloadSignature.nonce
 */


/**
 * @type {EventsReqBody}
 */
const EventsReqBody;

module.exports = EventsReqBody;



/**
 * @typedef {Object} EventPostParamsDtoParams
 * @prop {Date} created_date - client send
 */