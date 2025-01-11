// @ts-check
const { ml_kem1024 } = require('@noble/post-quantum/ml-kem');

module.exports = {
  ml_kem_gen_keys,
}

//ml_kem_gen_keys();

/**
 * @example```js
 * import { sha256 } from '@noble/hashes/sha256';

 * const passphrase = "secure-passphrase";
 * const passphraseHash = sha256(passphrase);

 * // Можно использовать этот хэш как дополнительный компонент, например, для создания seed
 * const { publicKey, secretKey } = ml_kem1024.keygen(passphraseHash);
 * ```
 * Они генерируют ключи на основе случайных данных, не привязанных к пользовательскому вводу. Но при желание можно и паролем настроить
 */
function ml_kem_gen_keys() {
  // Генерация ключей
  const { publicKey, secretKey } = ml_kem1024.keygen();

  return {
    publicKey,
    secretKey,
  }

}

