// @ts-check


const { uuid } = require('../../libs');
const { CLIENT_PATHS } = require('../constants');
const { create_ensure_response } = require('./create_ensure_response');



module.exports = {
  create_event_socket,
}



/**
 * @typedef {import('./types/CreateEventSocketParams')} CreateEventSocketParams
 */
/**
* @param {CreateEventSocketParams} p
*/
function create_event_socket({ http_params: httpParams, app_ref }) {
  // Set headers for SSE
  httpParams.res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*', // Enable CORS if needed
  });



  /**
   * @type {PayloadByPing}
   */
  const payloadPing = undefined;

  Object.values(app_ref.clients_session_by_id).forEach((client_ctl) => {
    client_ctl.send_json({
      path: CLIENT_PATHS.ping,
    })
  });


  // Clean up when client disconnects
  httpParams.req.on('close', () => {
    delete app_ref.clients_session_by_id[new_client_id]
    ensureResOk();
    httpParams.res.end();
  });
}



