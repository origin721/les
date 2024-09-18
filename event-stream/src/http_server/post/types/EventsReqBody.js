// @ts-check

const { PATHS_POST } = require("../../constants");


/**
 * @typedef {Object} EventsReqBody
 * @prop {keyof typeof PATHS_POST} path
 * @prop {import("../../../types/RoomData")} body
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