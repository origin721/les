// @ts-check

/**
 * @typedef {Object} ServerSideEventConnection
 * @prop {import('../add/types/Add')} add
 * @prop {import('../registration/types/Registration')} registration
 * @prop {import('../send_by_pub_key_client/types/SendByPubKeyClient')} send_by_pub_key_client
 * //prop {ServerSideEventConnectionGetById} get_by_id
 * @prop {import('../remove_client_by_id/create_remove_client_by_id').RemoveClientById} remove_client_by_id
 */

/**
 * @type {ServerSideEventConnection}
 */
const ServerSideEventConnection;

module.exports = ServerSideEventConnection;

/**
 * @typedef {import('../get_by_id/types/ServerSideEventConnectionGetById')} ServerSideEventConnectionGetById
 */