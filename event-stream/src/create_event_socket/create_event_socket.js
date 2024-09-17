// @ts-check


const { uuid } = require('../libs');
const { CLIENT_PATHS } = require('../constants');

/**
 * @typedef {import('../types/ClientData.js')} ClientData
 */
/**
 * @typedef {import('../types/EnsureResponse.js')} EnsureResponse
 */
/**
 * @typedef {import('../app_ref.js')} AppRef
 */


// @ts-check
module.exports = {
  create_event_socket,
}


/**
 * @typedef {import('../types/HttpControllerParams.js')} HttpControllerParams
 */
/**
 * @typedef {Object} CreateEventSocketParams
 * @prop {HttpControllerParams} httpParams
 * @prop {AppRef} app_ref
 */
/**
* 
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



  const request_id = uuid();
  const new_client_id = uuid();
  /**
   * @type {ClientData}
   */
  const new_client = {
    client_id: new_client_id,
    send_json: (p) => {
      if (!p) return;
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
      }
      app_ref.ensure_response[request_id] = _response;
      const message = `data: ${JSON.stringify(_response)}\n\n`;
      httpParams.res.write(message);
    }
  };

  // user_id: new_client_id;

  const ensureResOk = create_ensure_response({ new_client, request_id });

  app_ref.clients_by_id[new_client_id] = new_client;

  /**
   * @type {PayloadByPing}
   */
  const payloadPing = undefined;

  Object.values(app_ref.clients_by_id).forEach((client_ctl) => {
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
    delete app_ref.clients_by_id[new_client_id]
    ensureResOk();
    httpParams.res.end();
  });
}

/**
 * 
 * @param {CreateEnsureResponseParam} p 
 */
function create_ensure_response(p) {
  let is_finished = false;
  const id_interval = setInterval(() => {
    p.new_client.send_json(
      p.app_ref
        .ensure_response
        .send_params[p.request_id]
    )
  }, 500);

  return () => {
    if (is_finished) return;
    is_finished = true;
    clearInterval(id_interval)
  };
}


/**
 * @typedef {Object} CreateEnsureResponseParam
 * @prop {ClientData} new_client
 * @prop {string} request_id
 * @prop {AppRef} app_ref
 */
