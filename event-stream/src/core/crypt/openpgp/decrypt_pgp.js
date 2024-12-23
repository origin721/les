// @ts-check

const openpgp = require('openpgp');

module.exports = {
  decrypt_pgp,
}

/**
 * @param {Props} p
 */
async function decrypt_pgp(p) {
  const message = await openpgp.readMessage({
    armoredMessage: p.encrypted_data // parse armored message
  });
  const { data: decrypted, signatures } = await openpgp.decrypt({
    message,
    verificationKeys: p.pub_verification_key
      ? await openpgp.readKey({ armoredKey: p.pub_verification_key})
      : undefined, // optional
    decryptionKeys: await openpgp.readPrivateKey({ armoredKey: p.private_decryption_key}),
  });

  console.log({decrypted, signatures, sign: await signatures[0].verified});

  return decrypted;
}

/**
 * @typedef {Object} Props
 * @prop {string} encrypted_data
 * @prop {string}  private_decryption_key
 * @prop {string} [pub_verification_key]
 */