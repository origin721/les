// @ts-check
const http = require('http');
const openpgp = require('openpgp');
const { v4: uuid } = require('uuid');
const { post_middleware } = require('./post_middleware');
const { create_event_socket } = require('./create_event_socket');
const app_ref = require('./app_ref');

console.log(uuid());
/**
 * @typedef {import('./types/HttpControllerParams')} HttpControllerParams
 */


const server = http.createServer((req, res) => {
  /**
   * @type {HttpControllerParams}
   */
  const httpParams = { req, res };
  if (req.url === '/events' && req.method === 'POST') {
    post_middleware({httpParams, app_ref});
  }
  else if (req.url === '/events') {
    create_event_socket({httpParams, app_ref});
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!');
  }
});

server.listen(8000, () => {
  console.log('Server running at http://localhost:8000/');
});











