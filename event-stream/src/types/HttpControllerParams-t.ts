// @ts-check
import http from 'http';


/**
 * @typedef {Object}  HttpControllerParams
 * @prop {http.IncomingMessage} req 
 * @prop {http.ServerResponse<http.IncomingMessage>
* & {req: http.IncomingMessage;}
* } res 
*/


export type HttpControllerParams = {
  req: http.IncomingMessage;
  res: http.ServerResponse<http.IncomingMessage>
    & {req: http.IncomingMessage;};

};

