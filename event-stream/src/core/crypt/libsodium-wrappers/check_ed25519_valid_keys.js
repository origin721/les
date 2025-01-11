// @ts-check

import { sign_ed25519 } from "./sign_ed25519.js";
import { verify_sign_ed25519 } from "./verify_sign_ed25519.js";


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
export async function check_ed25519_valid_keys({
  privateKey,
  publicKey,
}) {
  const message = 'hello ed25519';

  const signature = await sign_ed25519({
    privateKey: privateKey,
    message,
  });


  if(!signature) {
    return false;
  }

  const isValidOk = await verify_sign_ed25519({
    publicKey: publicKey,
    message: message,
    signature: signature,
  });

  return isValidOk === true;
}