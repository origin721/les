// @ts-check
const {server_side_event_connection} = require('./server_side_event_connection');

/**
 * @type {SharedService}
 */
const shared_service = {
  connection_service: server_side_event_connection,
};

module.exports = {
  shared_service,
}

/**
 * @typedef {import('./SharedService')} SharedService
 */