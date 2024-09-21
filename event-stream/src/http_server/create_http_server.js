// @ts-check
const http = require('http');
const openpgp = require('openpgp');
const { post_middleware } = require('./post/middleware');
const { create_event_socket } = require('./create_event_socket');
const {shared_service} = require('./shared_service');

module.exports = { create_http_server };

/**
 * @param {import('./CreateHttpServerParams')} p
 */
function create_http_server(p) {
  const server = http.createServer((req, res) => {
    /**
     * @type {HttpControllerParams}
     */
    const http_params = { req, res };
    if (req.url === '/events' && req.method === 'POST') {
      post_middleware({http_params: http_params, shared_service});
    }
    else if (req.url === '/events') {
      create_event_socket({httpParams: http_params, shared_service});
    }
    else { // TODO: поменять на 404
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello, World!');
    }
  });
  
  server.listen(p.port, () => {
    console.log(`Server running at http://localhost:${p.port}/`);
  });  
}



/**
 * @typedef {import('../types/HttpControllerParams')} HttpControllerParams
 */