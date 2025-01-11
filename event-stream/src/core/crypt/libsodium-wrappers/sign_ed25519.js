// @ts-check

import { sodium } from "../../../libs/index.js";

/**
 * 
 * @typedef {Object} Props
 * @prop {Uint8Array|string} privateKey
 * @prop {string} message
 */

/**
 * 
 * @param {Props} param0 
 */
export async function sign_ed25519({
  privateKey,
  message,
}) {
  try {
    // Инициализация библиотеки
    await sodium.ready;

    const messageBytes = sodium.from_string(message);

    const _privateKey = typeof privateKey === 'string'
      ? sodium.from_hex(privateKey)
      : privateKey;

    //console.log({messageBytes, message, _privateKey})

    // Создание подписи
    const signature = sodium.crypto_sign_detached(messageBytes, _privateKey);

    return sodium.to_hex(signature);

  }
  catch(err) {
    //console.error(err);
    return null;
  }
}
