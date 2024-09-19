// @ts-check

const { uuid } = require("../../../../libs");

module.exports = {create_new_connection};

/**
 * 
 * @param {import('./types/CreateNewConnection')} p 
 * @returns 
 */
function create_new_connection({
  connection_ref,
  params
}) {
  const {http_params} = params;
  const session_id = uuid();

  /**
   * @type {import("./types/ClientData")}
   */
  const new_client = {
    session_id,
    // TODO: доработать получшение ip клиента
    client_id: null,
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