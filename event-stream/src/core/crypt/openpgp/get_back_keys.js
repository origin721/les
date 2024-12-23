// @ts-check

const fs = require('fs');
const path = require('path');
const { generate_keys } = require('./generate_keys');

module.exports = {
  get_back_keys,
}

//get_back_keys().then(console.log);

let cache_result = null;

/**
 * Если ключей не было то создаёт и добавляет в секреты, если были то читает
 */
/**
 * 
 * @returns {ReturnType<import('./generate_keys')['generate_keys']>}
 */
function get_back_keys() {
  return new Promise((res, rej) => {
    if(cache_result) {
      res(cache_result);
      return;
    }

    const dirPath = path.join(__dirname, '..', '..', '..', '..', '.secret');
    const filePath = path.join(dirPath, 'server_keys.json');

    // Проверка, существует ли директория
    fs.access(dirPath, fs.constants.F_OK, (dirErr) => {
      if (dirErr) {
        // Если директория не существует, создаём её
        fs.mkdir(dirPath, { recursive: true }, (mkdirErr) => {
          if (mkdirErr) {
            console.error('Ошибка при создании директории:', mkdirErr);
            return;
          }
          console.log('Директория .secret создана');
          createOrReadFile();
        });
      } else {
        //console.log('Директория существует');
        createOrReadFile();
      }
    });

    // Функция для создания или чтения файла
    function createOrReadFile() {
      fs.access(filePath, fs.constants.F_OK, async(fileErr) => {
        if (fileErr) {
          const newKeys = await generate_keys();
          
          // Если файл не существует, создаём файл и пишем 'keys'
          fs.writeFile(filePath, JSON.stringify(newKeys), (writeErr) => {
            if (writeErr) {
              console.error('Ошибка при записи в файл:', writeErr);
              rej(writeErr);
              return;
            }
            cache_result = newKeys;
            res(newKeys);
            console.log('Файл создан с pgp ключами');
          });
        } else {
          // Если файл существует, читаем его
          fs.readFile(filePath, 'utf8', (readErr, data) => {
            if (readErr) {
              console.error('Ошибка при чтении файла:', readErr);
              rej(readErr);
              return;
            }
            const secretKeys = JSON.parse(data);
            cache_result = secretKeys;
            // 'Содержимое файла:'
            res(secretKeys);
          });
        }
      });
    }
  });
}


/**
 * @typedef {ReturnType<import('./generate_keys')['generate_keys']>} ResultObj
 * @prop {string}
 */