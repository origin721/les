// @ts-check
import { test, expect } from 'vitest';

import { sign_ed25519 } from './sign_ed25519.js';
import { generate_keys_ed25519 } from './generate_keys_ed25519.js';
import { verify_sign_ed25519 } from './verify_sign_ed25519.js';

test('ed25519 sign and verify', async () => {
  const keypair1 = await generate_keys_ed25519();

  const message = 'hello ed25519';

  const signature = await sign_ed25519({
    privateKey: keypair1.privateKey,
    message,
  });

  //console.log({signature});

  expect(signature).not.toBeNull();
  if(!signature) {
    console.log('signatureErr: ', signature);
    return;
  }

  const isValidOk = await verify_sign_ed25519({
    publicKey: keypair1.publicKey,
    message: message,
    signature: signature,
  });

  expect(isValidOk).toBe(true);

  
  const isValidErr = await verify_sign_ed25519({
    publicKey: (await generate_keys_ed25519()).publicKey,
    message: message,
    signature: signature,
  });

  expect(isValidErr).toBe(false);
});
