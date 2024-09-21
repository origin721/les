// @ts-check

/**
 * @typedef {Object} ConnectionRef
 * @prop {ServerSideEventConnectionRecordById} connection_by_id
 * @prop {RefsByPubKeyClientRecord} by_pub_key_client
 * @prop {ByResponseAwaiting} by_response_awaiting
 */

/**
 * @type {ConnectionRef}
 */
const ConnectionRef;

module.exports = ConnectionRef;

/**
 * @typedef {import('./ByResponseAwaiting')} ByResponseAwaiting
 * @typedef {import('../get_by_id/types/ServerSideEventConnectionRecordById')} ServerSideEventConnectionRecordById
 * @typedef {import('./RefsByPubKeyClientRecord')} RefsByPubKeyClientRecord
 */