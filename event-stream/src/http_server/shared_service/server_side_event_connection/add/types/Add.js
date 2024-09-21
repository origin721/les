// @ts-check
const {create_add} = require('../create_add');
/**
 * @typedef {(p: AddParams) => ReturnType<ReturnType<typeof create_add>>} Add
 */

/**
 * @type {Add}
 */
const Add;

module.exports = Add;

/**
 * @typedef {import('./AddParams')} AddParams
 */