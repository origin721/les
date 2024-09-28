// @ts-check

/**
 * param {string} connection_id
 * @param {import("../../../../types/HttpControllerParams")} http_params
 */
const send_by_connection_id = (http_params) => {
  http_params.res.writeHead(201);
  http_params.res.write("");
}