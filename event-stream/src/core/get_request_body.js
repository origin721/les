// @ts-nocheck
const http = require('http');

module.export = {
  get_request_body,
}

/**
 * 
 * @param {http.IncomingMessage} req 
 * @returns 
 */
async function get_request_body(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body)); // Парсим JSON из тела
      } catch (error) {
        resolve(null); // В случае ошибки парсинга возвращаем null
      }
    });
    req.on('error', (err) => {
      reject(err); // Обработка ошибок во время получения данных
    });
  });
};
