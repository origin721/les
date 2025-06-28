// @ts-check
import assert from 'assert'; // Встроенный модуль для проверок

import { sign_ed25519 } from './sign_ed25519.js';
import { generate_keys_ed25519 } from './generate_keys_ed25519.js';
import { verify_sign_ed25519 } from './verify_sign_ed25519.js';



Function.apply.apply(async () => {
  const keypair1 = await generate_keys_ed25519();

  const message = 'hello ed25519';

  const signature = await sign_ed25519({
    privateKey: keypair1.privateKey,
    message,
  });

  //console.log({signature});

  if(!signature) {
    assert.notStrictEqual(signature, null, 'Должна создаться сигнатура');
    console.log('signatureErr: ', signature);
    return;
  }

  const isValidOk = await verify_sign_ed25519({
    publicKey: keypair1.publicKey,
    message: message,
    signature: signature,
  });

  assert.deepStrictEqual(isValidOk, true, 'Подпись должна пройти');

  
  const isValidErr = await verify_sign_ed25519({
    publicKey: (await generate_keys_ed25519()).publicKey,
    message: message,
    signature: signature,
  });

  assert.deepStrictEqual(isValidErr, false, 'Подпись должна ругаться на несоответстиве ключа');
})