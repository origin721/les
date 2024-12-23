// @ts-check

const { ml_dsa65 } = require("@noble/post-quantum/ml-dsa");
const { generate_random_string } = require("../generate_random_string");

module.exports = {
  ml_dsa_gen_keys,
}

ml_dsa_gen_keys();

function ml_dsa_gen_keys() {
  const pass = generate_random_string({
    maxLength: 34,
    minLength: 26,
  })
  // Генерация ключей
  const seed = new TextEncoder().encode(pass); // Замените на безопасное значение!
  const { publicKey, secretKey } = ml_dsa65.keygen(seed);

  // Преобразуем ключи в строку (к примеру, в base64)
  const publicKeyStr = Buffer.from(publicKey).toString('base64');
  const secretKeyStr = Buffer.from(secretKey).toString('base64');

  // Выводим строковые представления ключей
  console.log('PublicKey (Base64):', publicKeyStr);
  console.log('SecretKey (Base64):', secretKeyStr);
}