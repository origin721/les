// Пример использования
const rusCharRange = [1040, 1103]; // Диапазон русских букв (А-я)
const engCharRange = [65, 122]; // Диапазон английских букв (A-z)
const digitRange = [48, 57]; // Диапазон цифр (0-9)
const symbolRange = [33, 47]; // Диапазон символов (!-/)
// Группируем диапазоны в массив
export const defaultCharRanges = [
  rusCharRange,
  engCharRange,
  digitRange,
  symbolRange,
] as CharRanges;

// Диапазон длины строки (от 10 до 20 символов)
// const lengthRange: LengthRange = [40, 60];

// const randomString = randomByRange(defaultCharRanges, lengthRange);
// console.log(randomString);

type CharRanges = Array<[number, number]>;
type LengthRange = [number, number];
export function randomByRange(
  charRanges: CharRanges,
  lengthRange: LengthRange
) {
  const [lengthStart, lengthEnd] = lengthRange;

  // Генерируем случайное количество символов в строке
  const randomLength =
    Math.floor(Math.random() * (lengthEnd - lengthStart + 1)) + lengthStart;

  let result = "";

  for (let i = 0; i < randomLength; i++) {
    // Выбираем случайный диапазон из charRanges
    const [rangeStart, rangeEnd] =
      charRanges[Math.floor(Math.random() * charRanges.length)];

    // Генерируем случайный символ из выбранного диапазона
    const randomCharCode =
      Math.floor(Math.random() * (rangeEnd - rangeStart + 1)) + rangeStart;
    result += String.fromCharCode(randomCharCode);
  }

  return result;
}
