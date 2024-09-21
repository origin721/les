// @ts-check

const { uuid } = require("../../../../libs");

module.exports = {create_new_connection};

/**
 * 
 * @param {import('./types/CreateNewConnection')} http_params
 */
function create_new_connection(http_params) {
  const connection_id = uuid();

  /**
   * @type {import("../types/SseClientService")}
   */
  const new_client = {
    connection_id,
    // TODO: доработать получшение ip клиента
    pub_key_client: null,
    send_json: (p) => {
      if (!p) return;
      const response_id = uuid();

      /**
       * @type {import("../../types/ServerSideEventResponse/SSEResponse")}
       */
      const _response = {
        path: p.path,
        response_id,
        created_date: new Date(),
        // active_users: Object.keys(connection_ref.connection_by_id).length,
        body: p.body,
      };
      
      const message = `data: ${JSON.stringify(_response)}\n\n`;
      http_params.res.write(message);
    }
  };



  return new_client;
}