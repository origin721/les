// @ts-check
import sodium from 'libsodium-wrappers';
import { uint8ArrayToString } from '../../uint8ArrayToString.js';

/**
 * @typedef {Object} Props
 * @prop {string|Uint8Array} receiverPrivateKey
 * @prop {string|Uint8Array} senderPublicKey
 * @prop {string|Uint8Array} cipherText
 * @prop {string|Uint8Array} nonce
 * @prop {boolean} [isDisableDebugger]
 * Выключет сообщения о ошибках например при 
 * брутфорсе можно отключать что бы не сыпались ошибки
 */
/**
 * @param {Props} param0 
 */
export async function decrypt_curve25519_verify({
  receiverPrivateKey,
  senderPublicKey,
  cipherText,
  nonce,
  isDisableDebugger,
}) {
  try {
    await sodium.ready;

    const _receiverPrivateKey = typeof receiverPrivateKey === 'string'
      ? sodium.from_hex(receiverPrivateKey)
      : receiverPrivateKey;

    const _senderPublicKey = typeof senderPublicKey === 'string'
      ? sodium.from_hex(senderPublicKey)
      : senderPublicKey;

    const _nonce = typeof nonce === 'string'
      ? sodium.from_hex(nonce)
      : nonce;

    const _cipherText = typeof cipherText === 'string'
      ? sodium.from_hex(cipherText)
      : cipherText;

    // Расшифровка (получатель использует свой приватный и публичный ключ отправителя)
    const decryptedMessage = sodium.crypto_box_open_easy(
      _cipherText,                    // Зашифрованное сообщение
      _nonce,                         // Nonce
      _senderPublicKey,       // Публичный ключ отправителя
      _receiverPrivateKey     // Приватный ключ получателя
    );

    return uint8ArrayToString(decryptedMessage);
  }
  catch (err) {
    if(!isDisableDebugger) console.error(err);
    return null;
  }
}