// @ts-check


/**
 * param {string} connection_id
 * @param {import("../../../../types/HttpControllerParams")} http_params
 * @param {import('../../../shared_service')['shared_service']} shared_service
 * @param {import("./types/ReqParam")} reqParam
 */
const send_by_pub_key = (http_params, shared_service, reqParam) => {
  const _v = shared_service.send_by_pub_key_client({
    pub_key_client: reqParam.pub_key_client,
    body: reqParam.body,
  });

  if(_v.is_ok) {
    http_params.res.writeHead(201);
    http_params.res.write("");
  }
  else {
    http_params.res.writeHead(400);
    http_params.res.write("Bed request");
  }
}