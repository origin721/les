// @ts-check

const { ml_dsa65, ml_dsa87 } = require("@noble/post-quantum/ml-dsa");
const { generate_random_string } = require("../generate_random_string");
const { generate_random_string_secure } = require("../generate_random_string_secure");

module.exports = {
  ml_dsa_gen_keys,
}

ml_dsa_gen_keys();
// test_analysis_of_resistance_to_brute_force();

function ml_dsa_gen_keys({
  pass = generate_random_string_secure({
    maxLength: 34,
    minLength: 26,
    maxCharNum: 127,
    minCharNum: 1,
  })
} = {}) {
  // Генерация ключей
  const seed = new TextEncoder().encode(pass); // Замените на безопасное значение!
  const { publicKey, secretKey } = ml_dsa87.keygen(seed);

  return {
    publicKey,
    secretKey,
    pass,
  }

  // Преобразуем ключи в строку (к примеру, в base64)
  const publicKeyStr = Buffer.from(publicKey).toString('base64');
  const secretKeyStr = Buffer.from(secretKey).toString('base64');

  // Выводим строковые представления ключей
  console.log('PublicKey (Base64):', publicKeyStr);
  console.log('SecretKey (Base64):', secretKeyStr);
}


/**
 * Анализ показал что если передать ту же парольную фразу то можно получить тут же ключь 1 в 1 в 100% случаях
 */
function test_analysis_of_resistance_to_brute_force() {
  const first_entity = ml_dsa_gen_keys();
  const publicKeyStr = Buffer
    .from(first_entity.publicKey)
    .toString('base64');
  const secretKeyStr = Buffer
    .from(first_entity.secretKey)
    .toString('base64');

  const result = {
    pubkey_ok: 0,
    secretKey_ok: 0,
    pubkey_failure: 0,
    secretKey_failure: 0,
  }
  
  for(let i = 0; i < 100_000_000; ++i) {
    const new_keys = ml_dsa_gen_keys({pass: first_entity.pass});
    const newPublicKeyStr = Buffer
      .from(new_keys.publicKey)
      .toString('base64');
    const newSecretKeyStr = Buffer
      .from(new_keys.secretKey)
      .toString('base64');
    
    if(newPublicKeyStr === publicKeyStr) ++result.pubkey_ok;
    else ++result.pubkey_failure;

    if(newSecretKeyStr === secretKeyStr) ++result.secretKey_ok;
    else ++result.secretKey_failure;

    if(i % 1000) console.log({result});
  }
}