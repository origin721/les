// @ts-check

module.exports = {
  stringToUint8Array,
}

// Функция для преобразования строки в Uint8Array
function stringToUint8Array(str) {
  return new TextEncoder().encode(str);
}