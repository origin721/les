// @ts-check

const { get_request_body, check_validation } = require("../core");
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
function post_middleware(httpParams) {
  return get_request_body(httpParams.req).then((body) => {
    events_post_middleware({body,httpParams,app_ref})
  });
}
