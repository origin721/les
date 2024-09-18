// @ts-check



function create_connection_ref() {
  /**
   * @type {ConnectionRef}
   */
  const connection_ref = {
    connection_by_id: {},
  };
  return connection_ref;
};

module.exports = { create_connection_ref };

/**
 * @typedef {import('./types/ConnectionRef')} ConnectionRef
 */