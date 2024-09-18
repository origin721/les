// @ts-check

const { uuid } = require("../../../../libs");

module.exports = { create_new_connection };

function create_new_connection(params) {
  const {app_ref, httpParams} = params;
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
        path: params.path,
        response_id,
        created_date: new Date(),
        active_users: Object.keys(app_ref.clients_by_id).length,
        body: p.body,
      };
      
      const message = `data: ${JSON.stringify(_response)}\n\n`;
      httpParams.res.write(message);
    }
  };

  return new_client;
}