// @ts-check
const { PATHS_POST } = require('../constants');
const { check_validation } = require("../core");

module.exports = { events_post_middleware };

/**
 * @typedef {import('../types/EventsReqBody')} EventsReqBody
 */
/**
 * @typedef {import('./types/EventsPostMiddlewareParams')} EventsPostMiddlewareParams
 */

/**
 * @param {EventsPostMiddlewareParams} params
 */
function events_post_middleware(params) {
  const is_valid_body = check_validation(() => {
    /**
     * См. {@link EventsReqBody}.
     */
    return (
      typeof params.body.path === 'string'
      && params.body.payload.room_ids.every(r => typeof r === 'string')
      && typeof params.body.payload.owner_id === 'string'
      && params.body.payload.user_ids.every(u => typeof u === 'string')
    );
  });
  if (!is_valid_body) {
    params.httpParams.res.writeHead(400);
    params.httpParams.res.end("400 Bad Request");

    return;
  }

  switch (params.body.path) {
    case PATHS_POST.response_ok: {

    }
      break;
    case PATHS_POST.create_room: {
      // TODO: перебирать в массиве
      params.app_ref.rooms_by_id[params.body.payload.room_id] = params.body.payload;
      console.log('add room: ', params.app_ref.rooms_by_id);
      params.httpParams.res.writeHead(201);
      params.httpParams.res.write("");
    }
      break;
    default:
      params.httpParams.res.writeHead(404);
      params.httpParams.res.write("");
  };
  return;
};
