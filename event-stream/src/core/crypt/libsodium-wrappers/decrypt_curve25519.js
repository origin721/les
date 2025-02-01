// @ts-check
import { sodium } from '../../../libs/sodium.js';
import { uint8ArrayToString } from '../../uint8ArrayToString.js';

/**
 * @typedef {Object} Props
 * @prop {string|Uint8Array} receiverPrivateKey
 * @prop {string|Uint8Array} receiverPublicKey
 * @prop {string|Uint8Array} cipherText
 */
/**
 * Рашифровка без проверки подписи
 * @param {Props} param0 
 */
export async function decrypt_curve25519({
  receiverPrivateKey,
  cipherText,
  receiverPublicKey,
}) {
  try {
    await sodium.ready;

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