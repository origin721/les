/**
 * Правильный рандом
 * @param length 
 * @param chars 
 * @returns 
 */
export function generateRandomString(
  length: number,
  chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_+#-!@$%^&*(){}\\/.,~`',
) {
    let result = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
    }
    return result;
}
//console.log(generateRandomString(16)); // Пример: "f8W2x9PzQ1KcL7Mv"
