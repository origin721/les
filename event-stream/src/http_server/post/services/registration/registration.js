// @ts-check

const { create_empty_entity, ERROR_TYPES } = require("../../../../validation");
const { PATHS_POST } = require("../../../constants");

module.exports = { registration }


/**
 * @param {import("./types/RegistrationParams")} params
 * @returns {void}
 */
function registration({ httpParams, request }) {
  const _v = validation(request);
  if (!_v.is_ok) {
    httpParams.res.writeHead(400);
    httpParams.res.write("invalid params");

    return;
  }

  httpParams.res.writeHead(201);
  httpParams.res.write("");
};

/**
 * 
 * @param {import('./types/RegistrationRequest')} request 
 * @returns 
 */
function validation(request) {
  const _v = create_empty_entity();
  try {
    if (request.path === PATHS_POST.server_event_registration) {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: `.path ${PATHS_POST.server_event_registration} !== ${request.path}`
      })
    };
    if (typeof request.body.connection_id !== 'string') {
      _v.err_messages.push({
        type: ERROR_TYPES.INVALID_PARAMS,
        message: '.connection_id обязательный'
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
