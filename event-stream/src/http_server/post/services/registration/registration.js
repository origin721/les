// @ts-check

const { create_empty_entity, ERROR_TYPES } = require("../../../../validation");
const { PATHS_POST } = require("../../../constants");


module.exports = { registration }


/**
 * @param {import("../../middleware/types/EventsPostMiddlewareParams")} params
 * param {import("./types/RegistrationParams")} params
 * @returns {void}
 */
function registration({ http_params, body, shared_service }) {
  const _v = validation(body);
  if (!_v.is_ok) {
    http_params.res.writeHead(400);
    http_params.res.write("invalid params");

    return;
  }

  const service_v = shared_service.registration({
    connection_id: body.body.connection_id,
    pub_key_client: body.body.pub_key_client,
  });

  if(service_v.is_ok) {
    http_params.res.writeHead(201);
    http_params.res.write("");
  }
  else {
    http_params.res.writeHead(400);
    http_params.res.write("Bed request");
  }
};

/**
 * 
 * @param {import('./types/RegistrationRequest')} body 
 * @returns 
 */
function validation(body) {
  const _v = create_empty_entity();
  try {
    if (body.path === PATHS_POST.server_event_registration) {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: `.path ${PATHS_POST.server_event_registration} !== ${body.path}`
      })
    };
    if (typeof body.body.connection_id !== 'string') {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: '.connection_id обязательный'
      })
    };
    if (typeof body.body.pub_key_client !== 'string') {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: '.pub_key_client обязательный'
      })
    };

    if (!_v.err_messages.length) _v.is_ok = true;
  }
  catch (err) {
    console.error(__filename, err);

  }
  console.log('Ошибка регистрации: ', _v);
  return _v;
}
