/**
 * Счётчик от 0 до максимального числа
 * Когда счётчик заканчивается число
 * становится минимальным
 */
export const create_counter_generator = () => {
  let counter = -1;

  return function counter_generator() {
    ++counter;
    if(counter >= Number.MAX_SAFE_INTEGER) {
      counter = Number.MIN_SAFE_INTEGER;
    }

    return counter;
  }
}