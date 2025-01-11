// @ts-check
import assert from 'assert'; // Встроенный модуль для проверок

import { generate_keys } from "./generate_keys.js";
import { encrypt_curve25519_verify } from './encrypt_curve25519_verify.js';
import { decrypt_curve25519_verify } from './decrypt_curve25519_verify.js';



Function.apply.apply(async () => {
  const senderKeyPair = await generate_keys();
  const receiverKeyPair = await generate_keys();


  const message = 'hello curve25519';

  const cipher = await encrypt_curve25519_verify({
    receiverPublicKey: receiverKeyPair.publicKey,
    senderPrivateKey: senderKeyPair.privateKey,
    message,
  })

  if(!cipher) {
    assert.notStrictEqual(cipher, null, 'Зашифрованный текст должен быть');
    console.log('cipherTextErr: ', cipher);
    return;
  }

  // console.log({cipher})

  const decryptedMessage = await decrypt_curve25519_verify({
    cipherText: cipher.cipherText,
    nonce: cipher.nonce,
    receiverPrivateKey: receiverKeyPair.privateKey,
    senderPublicKey: senderKeyPair.publicKey,
  });

  //console.log({decryptedMessage});

  assert.deepStrictEqual(decryptedMessage, message, 'Сообщение должно расшифроваться и быть идентичным');
})