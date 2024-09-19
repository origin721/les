// @ts-check

const { create_add } = require('./add.js/create_add');
const { create_connection_ref } = require('./connection_ref');
const { create_get_by_id } = require('./get_by_id');

function create_server_side_event_connection() {
  const connection_ref = create_connection_ref();

  /**
 * @type {import('./types/ServerSideEventConnection')}
 */
  const server_side_event_connection = {
    /**
     * Для получения по id сесии сущьности клиента
     * Например для отправки данных
     */
    get_by_id: create_get_by_id(connection_ref),
    add: create_add(connection_ref),
  }

  return server_side_event_connection;
}


module.exports = {
  create_server_side_event_connection,
}