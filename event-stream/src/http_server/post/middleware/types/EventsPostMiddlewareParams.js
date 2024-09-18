// @ts-check

const { shared_service } = require('../../../shared_service');

/**
 * @typedef {import('../../types/EventsReqBody')} EventsReqBody
 */
/**
 * @typedef {import('../../../../types/HttpControllerParams')} HttpControllerParams
 */

/**
 * @typedef {Object} EventsPostMiddlewareParams
 * @prop {HttpControllerParams} httpParams 
 * @prop {EventsReqBody} body
 * @prop {typeof shared_service} shared_service
 */

/**
 * @type {EventsPostMiddlewareParams}
 */
const EventsPostMiddlewareParams;

module.exports = EventsPostMiddlewareParams;
