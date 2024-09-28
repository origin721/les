// @ts-check

const { create_add } = require('./add/create_add');
const { connection_ref } = require('./connection_ref');
const { create_get_by_id } = require('./get_by_id');
const { create_registration } = require('./registration/create_registration');
const { create_remove_client_by_id } = require('./remove_client_by_id/create_remove_client_by_id');
const { create_send_by_pub_key_client: create_send_by_client_id } = require('./send_by_pub_key_client');


function create_server_side_event_connection() {

  /**
 * @type {import('./types/ServerSideEventConnection')}
 */
  const server_side_event_connection = {
    /**
     * Для получения по id сесии сущьности клиента
     * Например для отправки данных
     */
    // get_by_id: create_get_by_id(connection_ref),
    /**
     * Для добавления новой сесии
     */
    add: create_add(connection_ref),
    /**
     * Для подтверждение сесии 
     * добавляет pub_key_client
     */
    registration: create_registration(connection_ref),
    /**
     * Для отправки сообщения клиенту по его id(публичному ключу в будущем)
     */
    send_by_pub_key_client: create_send_by_client_id(connection_ref),

    /**
     * Удаляет сесию
     */
    remove_client_by_id: create_remove_client_by_id(connection_ref),
  }

  return server_side_event_connection;
}


module.exports = {
  create_server_side_event_connection,
}