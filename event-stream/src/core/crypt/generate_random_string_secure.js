// @ts-check

// Важно для хорошей генерации рандома
const { randomInt } = require('crypto');

module.exports = {
  generate_random_string_secure,
}


function generate_random_string_secure({
  minLength = 300,
  maxLength = 800,
  minCharNum = 32, // Первые управляющие символы в ASCII пропускаются
  maxCharNum = 126 // Видимые символы ASCII заканчиваются
} = {}) {
  if (minLength < 1 || maxLength < minLength) {
    throw new Error("Invalid length parameters.");
  }
  if (minCharNum < 0 || maxCharNum < minCharNum) {
    throw new Error("Invalid character range parameters.");
  }

  const targetLength = randomInt(minLength, maxLength + 1);

  let result = "";
  for (let i = 0; i < targetLength; i++) {
    const randomCharCode = randomInt(minCharNum, maxCharNum + 1);
    result += String.fromCharCode(randomCharCode);
  }

  return result;
}


// Пример использования
 const randomString = generate_random_string_secure({
   minLength: 600,
   maxLength: 12000,
   maxCharNum: 1200,
   minCharNum: 1,
 });
console.log(randomString);
