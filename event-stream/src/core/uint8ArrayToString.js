// @ts-check

// Функция для преобразования Uint8Array обратно в строку
export function uint8ArrayToString(uint8Array) {
  return new TextDecoder().decode(uint8Array);
}