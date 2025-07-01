// @ts-check
import { test, expect } from 'vitest';

import { decrypt_curve25519 } from "./decrypt_curve25519.js";
import { encrypt_curve25519 } from "./encrypt_curve25519.js";
import { generate_keys_curve25519 } from "./generate_keys_curve25519.js";

test('curve25519 without verify encryption and decryption', async () => {
  const receiverKeyPair = await generate_keys_curve25519();

  const message = 'hello curve25519';

  const cipherText = await encrypt_curve25519({
    receiverPublicKey: receiverKeyPair.publicKey,
    message,
  })

  expect(cipherText).not.toBeNull();
  if(!cipherText) {
    console.log('cipherTextErr: ', cipherText);
    return;
  }

  const decryptedMessage = await decrypt_curve25519({
    cipherText,
    receiverPrivateKey: receiverKeyPair.privateKey,
    receiverPublicKey: receiverKeyPair.publicKey,
  });

  expect(decryptedMessage).toBe(message);

  const keyPairNew = await generate_keys_curve25519();

  const decryptedMessageErr = await decrypt_curve25519({
    cipherText,
    receiverPrivateKey: keyPairNew.privateKey,
    receiverPublicKey: keyPairNew.publicKey,
  });

  expect(decryptedMessageErr).toBeNull();
});
