// @ts-check

import { HttpControllerParams } from "../../../../../types/HttpControllerParams";

export type Body = {
  connection_id: string;//ServerSideEventConnectionItem['connection_id']
  pub_key_client: string;
}

/**
 * @typedef {Object} RegistrationParams
 * @prop {HttpControllerParams} http_params
 * @prop {import('./RegistrationRequest')} body
 */

export type RegistrationParams = {
 http_params: HttpControllerParams;
 body: Body;
};

export default RegistrationParams;