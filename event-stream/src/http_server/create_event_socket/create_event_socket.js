// @ts-check


const { uuid } = require('../../libs');
const { CLIENT_PATHS } = require('../constants');
const { create_ensure_response } = require('./create_ensure_response');



module.exports = {
  create_event_socket,
}



/**
* @param {import('./types/CreateEventSocketParams')} p
*/
function create_event_socket({ http_params, shared_service }) {
  // Set headers for SSE
  http_params.res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*', // Enable CORS if needed
  });

  shared_service.add({
    http_params,
  })



  // Clean up when client disconnects
  http_params.req.on('close', () => {
    delete app_ref.clients_session_by_id[new_client_id]
    ensureResOk();
    http_params.res.end();
  });
}



