// @ts-check

/**
 * @typedef {Object} ConnectionRef
 * @prop {ServerSideEventConnectionRecordById} connection_by_id
 * @prop {RefsByPubKeyClientRecord} by_pub_key_client
 */

/**
 * @type {ConnectionRef}
 */
const ConnectionRef;

module.exports = ConnectionRef;

/**
 * @typedef {import('../get_by_id/types/ServerSideEventConnectionRecordById')} ServerSideEventConnectionRecordById
 * @typedef {import('./RefsByPubKeyClientRecord')} RefsByPubKeyClientRecord
 */