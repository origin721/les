// @ts-check
import sodium from 'libsodium-wrappers';

/**
 * @typedef {Object} Props
 * @prop {string|Uint8Array} receiverPublicKey
 * @prop {string} message
 */
/**
 * @param {Props} param0 
 */
export async function encrypt_curve25519({
  receiverPublicKey,
  message,
}) {
  try {
    await sodium.ready;

    const _receiverPublicKey = typeof receiverPublicKey === 'string'
      ? sodium.from_hex(receiverPublicKey)
      : receiverPublicKey;

    // Сообщение для шифрования
    const _message = sodium.from_string(message);

    // Шифрование (отправитель использует свой приватный и публичный ключ получателя)
    const cipherText = sodium.crypto_box_seal(
      _message,               // Сообщение
      _receiverPublicKey,     // Публичный ключ получателя .publicKey
    );

    return sodium.to_hex(cipherText);

  }
  catch(err) {
    return null;
  }
}

