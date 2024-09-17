// @ts-check

const PATHS_POST_EVENTS = require('../constants/PATHS_POST');
/**
 * @typedef {import('./RoomData')} RoomData
 */

/**
 * @typedef {Object} EventPostParamsDto
 * @prop {keyof typeof PATHS_POST_EVENTS} path
 * @prop {RoomData|ResponseOkDto} payload
 */

/**
 * @type {EventPostParamsDto}
 */
const EventPostParamsDto;

module.exports = EventPostParamsDto;