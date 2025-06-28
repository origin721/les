// @ts-check

import { decrypt_curve25519_verify } from "./decrypt_curve25519_verify.js";
import { encrypt_curve25519_verify } from "./encrypt_curve25519_verify.js";


/**
 * @typedef {Object} Props
 * @prop {string|Uint8Array} privateKey
 * @prop {string|Uint8Array} publicKey
 */
/**
 * Проверяет валидность ключей, если там мусор место работающих ключей то вернёт false, если ключи рабочие то вернёт true
 * @param {Props} param0 
 * @returns {Promise<boolean>}
 */
export async function check_curve25519_valid_keys({
  privateKey,
  publicKey,
}) {
  const message = 'hello curve25519';

  const cipher = await encrypt_curve25519_verify({
    receiverPublicKey: publicKey,
    senderPrivateKey: privateKey,
    message,
  })

  if(!cipher) {
    return false;
  }

  const decryptedMessage = await decrypt_curve25519_verify({
    cipherText: cipher.cipherText,
    nonce: cipher.nonce,
    receiverPrivateKey: privateKey,
    senderPublicKey: publicKey,
  });


  return decryptedMessage === message;
}