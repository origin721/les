// @ts-check

const { CLIENT_PATHS } = require("../../../constants");


/**
 * @typedef {Object} SendJsonDtoParamsConnection
 * @prop {ConnectSuccessResponseBody} body
 * @prop {keyof CLIENT_PATHS['connect_success']} path
 */


/**
 * @type {SendJsonDtoParamsConnection}
 */
const SendJsonDtoParamsConnection;

module.exports = SendJsonDtoParamsConnection;

/**
 * @typedef {import("../ServerSideEventResponse/connection/ConnectSuccessResponseBody")} ConnectSuccessResponseBody
 */