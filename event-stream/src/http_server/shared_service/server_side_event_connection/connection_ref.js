// @ts-check


function create_connection_ref() {
  /**
   * TODO по сути модуль connection это и есть shared_service
   * Потом поднять на уровень выше
   * @type {ConnectionRef}
   */
  const connection_ref = {
    connection_by_id: {},
    by_pub_key_client: {},
    by_response_awaiting: {},
  };
  
  return connection_ref;
};

module.exports = { create_connection_ref };

/**
 * @typedef {import('./types/ConnectionRef')} ConnectionRef
 */