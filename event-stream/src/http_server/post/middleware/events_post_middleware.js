// @ts-check
const { PATHS_POST } = require('../../constants');
const { check_validation } = require("../../../core");
const { create_empty_entity, ERROR_TYPES } = require('../../../validation');
const { registration } = require('../services');

module.exports = { events_post_middleware };

/**
 * @typedef {import('../types/EventsReqBody')} EventsReqBody
 */

/**
 * @param {import('./types/EventsPostMiddlewareParams')} params
 */
function events_post_middleware(params) {
  const _v = events_post_middleware_validation(params.body);
  const {http_params} = params

  if (!_v.is_ok) {
    http_params.res.writeHead(400);
    http_params.res.end("400 Bad Request");

    return;
  }


  switch (params.body.path) {
    case PATHS_POST.server_event_registration: {
      registration(params);
      break;
    }
    case PATHS_POST.send_by_connection_id: {
      send_by_connection_id(http_params);
      break;
    }
    // case PATHS_POST.create_room: {
    //   // TODO: перебирать в массиве
    //   params.app_ref.rooms_by_id[params.body.payload.room_id] = params.body.payload;
    //   console.log('add room: ', params.app_ref.rooms_by_id);
    //   params.httpParams.res.writeHead(201);
    //   params.httpParams.res.write("");
    // }
    //   break;
    default:
      params.http_params.res.writeHead(404);
      params.http_params.res.write("");
  };
  return;
};

function events_post_middleware_validation(body) {
  const _v = create_empty_entity();
  try {
    if (typeof body.path !== 'string') {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: ".path required"
      })
    }
    if(_v.err_messages.length) _v.is_ok = true;
  }
  catch (err) {
    console.error('POST: ', {body, _v})
  }

  return _v;
}
