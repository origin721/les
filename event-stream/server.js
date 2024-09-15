// @ts-check
const http = require('http');
const openpgp = require('openpgp');
const { v4: uuid } = require('uuid');

console.log(uuid());

/**
 * @typedef {Object} SendJsonDto
 * @prop {string} message
 */

/**
 * @typedef {Object} SendJsonParam
 * @prop {string} user_id
 * @prop {string} message
 */
/**
 * @typedef {(p: SendJsonDto) => void} SendJson
 */
/**
 * @typedef {Object} ClientData
 * @prop {string} client_id
 * @prop {SendJson} send_json
 */
/**
 * @type {Record<string, ClientData>}
 */
const clientsById = {};

const server = http.createServer((req, res) => {
  if (req.url === '/events' && req.method === 'POST') {
    res.end('Hello, World!');
    console.log('post ok');
  }
  else if (req.url === '/events') {
    // Set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*', // Enable CORS if needed
    });



    const new_client_id = uuid();
    /**
     * @type {ClientData}
     */
    const new_client = {
      client_id: new_client_id,
      send_json: (p) => {
        const message = `data: ${JSON.stringify({
          message: p.message,
          date_created: new Date().toLocaleTimeString(),
        })}\n\n`;
        res.write(message);
      }
    };

    clientsById[new_client_id] = new_client;

    // Send a message every second
    // const intervalId = setInterval(() => {
    const message = `data: ${JSON.stringify({ date_created: new Date().toLocaleTimeString() })}\n\n`;
    res.write(message);
    Object.values(clientsById).forEach((client_ctl) => {
      client_ctl.send_json({
        message: 'ok',
      })
    });

    // }, 1000);


    // Clean up when client disconnects
    req.on('close', () => {
      clearInterval(intervalId);
      res.end();
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!');
  }
});

server.listen(8000, () => {
  console.log('Server running at http://localhost:8000/');
});
