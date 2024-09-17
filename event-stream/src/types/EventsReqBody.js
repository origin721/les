// @ts-check


/**
 * @typedef {Object} EventsReqBody
 * @prop {keyof typeof PATHS_POST_EVENTS} path
 * @prop {EventPostParamsDtoParams} params
 * @prop {import("./RoomData")} payload
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