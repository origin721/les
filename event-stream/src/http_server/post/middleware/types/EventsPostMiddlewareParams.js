// @ts-check

const { shared_service } = require('../../../shared_service');

/**
 * @typedef {import('../../types/EventsReqBody')} EventsReqBody
 * @typedef {import('../../services/send_by_pub_key/types/ReqParam')} SendByPubKeyReqParam
 */
/**
 * @typedef {import('../../../../types/HttpControllerParams')} HttpControllerParams
 */

/**
 * @typedef {Object} EventsPostMiddlewareParams
 * @prop {HttpControllerParams} http_params
 * @prop {EventsReqBody|SendByPubKeyReqParam} body
 * @prop {typeof shared_service} shared_service
 */

/**
 * @type {EventsPostMiddlewareParams}
 */ // @ts-ignore
const EventsPostMiddlewareParams;
// @ts-ignore
module.exports = EventsPostMiddlewareParams;
