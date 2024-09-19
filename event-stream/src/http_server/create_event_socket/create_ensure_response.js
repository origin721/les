// @ts-check

module.exports = {
  create_ensure_response,
}

/**
 * @typedef {import('../shared_service/server_side_event_connection/types/SseClientService.js')} ClientData
 */

/**
 * @typedef {import('../shared_service/app_ref.js')} AppRef
 */


/**
 * @typedef {Object} CreateEnsureResponseParam
 * @prop {ClientData} new_client
 * @prop {string} request_id
 * @prop {AppRef} app_ref
 */

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

