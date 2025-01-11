// @ts-check

import { sodium } from "../../../libs/index.js";

/**
 * @typedef {Object} Props
 * @prop {string|Uint8Array} receiverPublicKey
 * @prop {string|Uint8Array} senderPrivateKey
 * @prop {string} message
 */
/**
 * @param {Props} param0 
 */
export async function encrypt_curve25519_verify({
  receiverPublicKey,
  senderPrivateKey,
  message,
}) {
  try {
    await sodium.ready;

    const _receiverPublicKey = typeof receiverPublicKey === 'string'
      ? sodium.from_hex(receiverPublicKey)
      : receiverPublicKey;

    const _senderPrivateKey = typeof senderPrivateKey === 'string'
      ? sodium.from_hex(senderPrivateKey)
      : senderPrivateKey;

    // Сообщение для шифрования
    const _message = sodium.from_string(message);

    // Генерация случайного nonce (вектор инициализации)
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

    // Шифрование (отправитель использует свой приватный и публичный ключ получателя)
    const cipherText = sodium.crypto_box_easy(
      _message,               // Сообщение
      nonce,                  // Nonce
      _receiverPublicKey,     // Публичный ключ получателя .publicKey
      _senderPrivateKey       // Приватный ключ отправителя .privateKey
    );

    return ({
      nonce: sodium.to_hex(nonce),
      cipherText: sodium.to_hex(cipherText),
    });
  }
  catch (err) {
    return null;
  }
}

