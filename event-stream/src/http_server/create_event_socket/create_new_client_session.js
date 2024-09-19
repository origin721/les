// @ts-check

const { uuid } = require('../../libs/uuid.js');

module.exports = { create_new_client_session };

/**
 * @typedef {import('../shared_service/server_side_event_connection/types/SseClientService.js')} SseClientService
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
  const connection_id = uuid();

  /**
   * @type {SseClientService}
   */
  const new_client = {
    connection_id,
    pub_key_client: null,
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
        body: {
          path: p.path,
          body: p.body,
        }
      };
      app_ref.ensure_response[request_id] = _response;
      const message = `data: ${JSON.stringify(_response)}\n\n`;
      httpParams.res.write(message);
    }
  };

  return new_client;
}