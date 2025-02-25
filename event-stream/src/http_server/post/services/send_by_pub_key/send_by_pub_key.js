// @ts-check

module.exports = {
  send_by_pub_key,
}

/**
 * param {string} connection_id
 * @param {import("../../../../types/HttpControllerParams")} http_params
 * @param {import('../../../shared_service')['shared_service']} shared_service
 * @param {PayloadRequest} reqParam
 */
function send_by_pub_key(
  http_params,
  shared_service,
  reqParam,
) {
  const _v = shared_service.send_by_pub_key_client({
    pub_key_client: reqParam.body.pub_key_client,
    body: reqParam.body.message,
  });

  if(_v.is_ok) {
    http_params.res.writeHead(201);
    http_params.res.write('ok');
  }
  else {
    http_params.res.writeHead(400);
    http_params.res.write("Bed request");
  }
}

/**
 * @typedef {Object} PayloadRequest
 * @prop {string} path
 * @prop {string} uuid
 * @prop {Date} created_date
 * @prop {Object} body
 * @prop {string} body.message
 * @prop {string} body.pub_key_client
 */