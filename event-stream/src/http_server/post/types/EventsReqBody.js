// @ts-check

const { PATHS_POST } = require("../../constants");


/**
 * @typedef {Object} CommonEventReq
 * @prop {'send_by_connection_id'} path
 * 
 * @typedef {CommonEventReq|(
 * import('../services/registration/types/RegistrationRequest')
 * )} EventsReqBody
 */


/**
 * @type {EventsReqBody}
 */
const EventsReqBody;

module.exports = EventsReqBody;



/**
 * @typedef {Object} EventPostParamsDtoParams
 * @prop {Date} created_date - client send
 */