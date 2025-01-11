// @ts-check
import assert from 'assert'; // Встроенный модуль для проверок

import { decrypt_curve25519 } from "./decrypt_curve25519.js";
import { encrypt_curve25519 } from "./encrypt_curve25519.js";
import { generate_keys } from "./generate_keys.js";



Function.apply.apply(async () => {
  const keypair1 = await generate_keys();

  const message = 'hello curve25519';

  const cipherText = await encrypt_curve25519({
    receiverPublicKey: keypair1.publicKey,
    message,
  })

  if(!cipherText) {
    assert.notStrictEqual(cipherText, null, 'Зашифрованный текст должен быть');
    console.log('cipherTextErr: ', cipherText);
    return;
  }

  const decryptedMessage = await decrypt_curve25519({
    cipherText,
    receiverPrivateKey: keypair1.privateKey,
    receiverPublicKey: keypair1.publicKey,
  });

  assert.deepStrictEqual(decryptedMessage, message, 'Сообщение должно расшифроваться и быть идентичным');
})