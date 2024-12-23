// @ts-check
const crypto = require('crypto');

module.exports = {
  generate_random_string,
};

//console.log('Сгенерированная строка:', generate_random_string());

function generate_random_string({
  chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?/:;,.[]{}|`~'\"\\",
  minLength = 100,
  maxLength = 300,
} = {}) {

  // Функция для генерации случайной строки
    // Генерация случайной длины строки в пределах от minLength до maxLength
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

    let randomString = '';
    for (let i = 0; i < length; i++) {
      // Генерация случайного индекса из набора символов
      const randomIndex = crypto.randomInt(0, chars.length);
      randomString += chars[randomIndex];
    }
    return randomString;
}