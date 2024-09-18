// @ts-check

const { ERROR_TYPES } = require("../constants");

/**
 * @typedef {Object} ErrorEntity
 * @prop {keyof typeof ERROR_TYPES} type
 * @prop {string} message
 */

/**
 * @type {ErrorEntity}
 */
const ErrorEntity;

module.exports = ErrorEntity;