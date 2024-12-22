// @ts-check

const { get_request_body } = require("../../../core");
const { events_post_middleware } = require("./events_post_middleware");

// @ts-check
module.exports = {
  post_middleware,
}

/**
 * @typedef {import('./types/PostMiddleware')} PostMiddleware
 */


/**
 * 
 * @param {PostMiddleware} httpParams 
 */
function post_middleware({http_params: http_params, shared_service}) {
  return get_request_body(http_params.req).then((body) => {
    events_post_middleware({
      body,
      http_params: http_params,shared_service
    });
  }).catch(err => {
    http_params.res.writeHead(500);
    http_params.res.end();
  });
}
