// @ts-check
import sodium from 'libsodium-wrappers';

/**
 * @typedef {Object} Props
 * @prop {Uint8Array|string} publicKey
 * @prop {string} message
 * @prop {Uint8Array|string} signature
 */

/**
 * 
 * @param {Props} param0 
 */
export async function verify_sign_ed25519({
  publicKey,
  message,
  signature,
}) {
  try {
    // Инициализация библиотеки
    await sodium.ready;

    const messageBytes = sodium.from_string(message);

    const _publicKey = typeof publicKey === 'string'
      ? sodium.from_hex(publicKey)
      : publicKey;

    const _signature = typeof signature === 'string'
      ? sodium.from_hex(signature)
      : signature;

    // Проверка подписи
    const isValid = sodium.crypto_sign_verify_detached(
      _signature,
      messageBytes,
      _publicKey
    );

    return isValid;

  }
  catch(err) {
    return null;
  }
}
