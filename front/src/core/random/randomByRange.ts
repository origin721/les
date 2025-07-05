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

/**
 * Генерирует криптографически безопасное случайное число в диапазоне [min, max]
 * Использует только crypto.getRandomValues() без Math функций
 * @param min - минимальное значение (включительно)
 * @param max - максимальное значение (включительно)
 * @returns криптографически безопасное случайное число
 */
function getSecureRandomInRange(min: number, max: number): number {
  const range = max - min + 1;
  
  // Определяем количество байт, необходимых для представления диапазона
  let bytesNeeded = 1;
  let maxValue = 256;
  while (maxValue < range) {
    bytesNeeded += 1;
    maxValue *= 256;
  }
  
  // Вычисляем максимальное допустимое значение для равномерного распределения
  // Используем только арифметические операции, избегая Math
  const maxValidValue = maxValue - (maxValue % range);
  
  let randomValue: number;
  do {
    const randomBytes = new Uint8Array(bytesNeeded);
    crypto.getRandomValues(randomBytes);
    
    // Преобразуем байты в число без использования Math
    randomValue = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = randomValue * 256 + randomBytes[i];
    }
  } while (randomValue >= maxValidValue);
  
  return min + (randomValue % range);
}

export function randomByRange(
  charRanges: CharRanges,
  lengthRange: LengthRange
) {
  const [lengthStart, lengthEnd] = lengthRange;

  // Генерируем криптографически безопасное случайное количество символов в строке
  const randomLength = getSecureRandomInRange(lengthStart, lengthEnd);

  let result = "";

  for (let i = 0; i < randomLength; i++) {
    // Выбираем случайный диапазон из charRanges используя криптографически безопасный генератор
    const randomRangeIndex = getSecureRandomInRange(0, charRanges.length - 1);
    const [rangeStart, rangeEnd] = charRanges[randomRangeIndex];

    // Генерируем случайный символ из выбранного диапазона используя криптографически безопасный генератор
    const randomCharCode = getSecureRandomInRange(rangeStart, rangeEnd);
    result += String.fromCharCode(randomCharCode);
  }

  return result;
}
