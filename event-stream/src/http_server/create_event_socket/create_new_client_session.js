// @ts-check

const { uuid } = require('../../libs/uuid.js');

module.exports = { create_new_client_session };

/**
 * @typedef {import('../shared_service/server_side_event_connection/add.js/types/ClientData.js')} ClientData
 */
/**
 * @typedef {import('../../types/EnsureResponse.js')} EnsureResponse
 */

/**
 * @typedef {Object} CreateNewClientSessionParams
 */
/**
 * @param {CreateNewClientSessionParams} params 
 */
function create_new_client_session(params) {
  const {app_ref, httpParams} = params;
  const client_session_id = uuid();

  /**
   * @type {ClientData}
   */
  const new_client = {
    client_session_id,
    send_json: (p) => {
      if (!p) return;
      const request_id = uuid();

      /**
       * @type {EnsureResponse}
       */
      const _response = {
        request_id,
        date_created: new Date(),
        active_users: Object.keys(app_ref.clients_by_id).length,
        send_params: {
          path: p.path,
          payload: p.payload,
        }
      };
      app_ref.ensure_response[request_id] = _response;
      const message = `data: ${JSON.stringify(_response)}\n\n`;
      httpParams.res.write(message);
    }
  };

  return new_client;
}