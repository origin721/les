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
function create_event_socket({ httpParams, app_ref }) {
  // Set headers for SSE
  httpParams.res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*', // Enable CORS if needed
  });



  

  // user_id: new_client_id;



  // app_ref.clients_session_by_id[new_client_id] = new_client;

  /**
   * @type {PayloadByPing}
   */
  const payloadPing = undefined;

  Object.values(app_ref.clients_session_by_id).forEach((client_ctl) => {
    client_ctl.send_json({
      // payload: payloadPing,
      // send_params: {
      //   payload: undefined
      // },
      payload: payloadPing,
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



