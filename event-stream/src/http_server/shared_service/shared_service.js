// @ts-check
const {create_server_side_event_connection} = require('./server_side_event_connection');

/**
 * @type {SharedService}
 */
const shared_service = {
  connection_service: create_server_side_event_connection(),
};

module.exports = {
  shared_service,
}

/**
 * @typedef {import('./SharedService')} SharedService
 */