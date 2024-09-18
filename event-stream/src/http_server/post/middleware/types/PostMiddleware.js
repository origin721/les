// @ts-check

const { shared_service } = require('../../../shared_service');

/**
 * @typedef {import('../../types/HttpControllerParams')} HttpControllerParams
 */

/**
 * @typedef {Object} PostMiddleware
 * @prop {HttpControllerParams} httpParams
 * @prop {typeof shared_service} shared_service
 */

/**
 * @type {PostMiddleware}
 */
const PostMiddleware;

module.exports = PostMiddleware;