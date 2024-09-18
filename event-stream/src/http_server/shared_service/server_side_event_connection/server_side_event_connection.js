// @ts-check

const { create_get_by_id } = require('./get_by_id');

/**
 * @type {ServerSideEventConnectionRecord}
 */
const record = {};

/**
 * @type {import('./ServerSideEventConnection')}
 */
const server_side_event_connection = {
  get_by_id: create_get_by_id(record),
}

module.exports = { 
  server_side_event_connection,
}

/**
 * @typedef {import('./ServerSideEventConnectionRecord')} ServerSideEventConnectionRecord
 */