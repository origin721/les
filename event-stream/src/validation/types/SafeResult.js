// @ts-check


/**
 * Для функций чей результат может быть не безопасным
 * @template T
 * @typedef {Object} SafeResult
 * @prop {boolean} is_ok
 * @prop {ErrorEntity[]} err_messages
 * @prop {T} result
 */

/**
 * @type {SafeResult}
 */
const SafeResult;

module.exports = SafeResult;

/**
 * @typedef {import('./ErrorEntity')} ErrorEntity
 */