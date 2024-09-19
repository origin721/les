// @ts-check
/**
 * @typedef {import('./types/ResponseOkDto')} ResponseOkDto
 */

module.exports = { response_ok_module };


/**
 * @param {import("./OkModuleParams")} params
 * @returns {void}
 */
function response_ok_module(params) {
  const response_ok_params = parse_response_ok_params(params.body);
  if(!response_ok_params) return;
  console.log('response_ok: ', response_ok_params.request_id);
  const resCtl = params.ensure_response[response_ok_params.request_id];
  if(!resCtl) return;
  resCtl.clear();

  params.httpParams.res.writeHead(201);
  params.httpParams.res.write("");
}


/**
 * @param {ResponseOkDto|any} params 
 * @returns {ResponseOkDto|null}
 */
function parse_response_ok_params(params) {
  try {
    if(typeof params.request_id === 'string') return params;
    return null;
  }
  catch (err) {
    console.error(err);
    return null;
  }
}