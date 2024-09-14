const http = require('http');
const openpgp = require('openpgp')

const server = http.createServer((req, res) => {
  if (req.url === '/events') {
    // Set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*', // Enable CORS if needed
    });

    // Send a message every second
    const intervalId = setInterval(() => {
      const message = `data: ${JSON.stringify({ time: new Date().toLocaleTimeString() })}\n\n`;
      res.write(message);
    }, 1000);

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
