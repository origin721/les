// @ts-check
import { sodium } from '../../../libs/index.js';
import { uint8ArrayToString } from '../../uint8ArrayToString.js';
import { generate_keys_curve25519_from_password } from './generate_keys_curve25519_from_password.js';

/**
 * @typedef {Object} Props
 * @prop {string} pass
 * @prop {string|Uint8Array} cipherText
 */
/**
 * Рашифровка без проверки подписи
 * @param {Props} param0 
 */
export async function decrypt_curve25519_from_pass({
  cipherText,
  pass,
}) {
  try {
    await sodium.ready;

    const {
      privateKey: receiverPrivateKey,
      publicKey: receiverPublicKey,
    } = await generate_keys_curve25519_from_password(pass);

    const _receiverPrivateKey = typeof receiverPrivateKey === 'string'
      ? sodium.from_hex(receiverPrivateKey)
      : receiverPrivateKey;

    const _receiverPublicKey = typeof receiverPublicKey === 'string'
      ? sodium.from_hex(receiverPublicKey)
      : receiverPublicKey;

    const _cipherText = typeof cipherText === 'string'
      ? sodium.from_hex(cipherText)
      : cipherText;

    // Расшифровка (получатель использует свой приватный и публичный ключ отправителя)
    const decryptedMessage = sodium.crypto_box_seal_open(
      _cipherText,                    // Зашифрованное сообщение
      _receiverPublicKey,            // публичный ключ получателя
      _receiverPrivateKey     // Приватный ключ получателя
    );

    return uint8ArrayToString(decryptedMessage);

  }
  catch(err) {
    return null;
  }
}