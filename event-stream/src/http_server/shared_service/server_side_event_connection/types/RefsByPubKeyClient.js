// @ts-check

const { REFS_BY_PUB_KEY_CLIENT_STATUSES } = require('../REFS_BY_PUB_KEY_CLIENT_STATUSES');

/**
 * @typedef {Object} RefsByPubKeyClient
 * @prop {string} pub_key_client
 * @prop {ServerSideEventConnectionItem['connection_id']} connection_id
 * @prop {keyof typeof REFS_BY_PUB_KEY_CLIENT_STATUSES} status
 */

/**
 * @type {RefsByPubKeyClient}
 */
const RefsByPubKeyClient;

module.exports = RefsByPubKeyClient;

/**
 * @typedef {import('./ServerSideEventConnectionItem')} ServerSideEventConnectionItem
 */