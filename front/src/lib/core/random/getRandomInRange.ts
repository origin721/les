/**
 * window.crypto - правильный рандом
 * @param min 
 * @param max 
 * @returns 
 */
export function getRandomInRange(min:number, max:number) {
    const range = max - min + 1;
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return min + (array[0] % range);
}
//console.log(getRandomInRange(1, 100)); // Случайное число от 1 до 100
