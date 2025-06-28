// @ts-check
import sodium from 'libsodium-wrappers';
import { generate_keys_curve25519_from_password } from './generate_keys_curve25519_from_password';

/**
 * @typedef {Object} Props
 * @prop {string} pass
 * @prop {string} message
 */
/**
 * @param {Props} param0 
 */
export async function encrypt_curve25519_from_pass({
  pass,
  message,
}) {
  try {
    await sodium.ready;

    const {
      publicKey: receiverPublicKey,
    } = await generate_keys_curve25519_from_password(pass);

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
