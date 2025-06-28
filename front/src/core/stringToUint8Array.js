// @ts-check

// Функция для преобразования строки в Uint8Array
export function stringToUint8Array(str) {
  return new TextEncoder().encode(str);
}
