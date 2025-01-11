// @ts-check

module.exports = {
  uint8ArrayToString,
}

// Функция для преобразования Uint8Array обратно в строку
function uint8ArrayToString(uint8Array) {
  return new TextDecoder().decode(uint8Array);
}