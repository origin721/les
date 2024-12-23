// @ts-check
const openpgp = require('openpgp');
const { get_back_keys } = require('./get_back_keys');
const { decrypt_pgp } = require('./decrypt_pgp');
const { generate_keys } = require('./generate_keys');


module.exports = {
  encrypt_pgp,
}

Function.apply.apply(async() => {
  const keys = await get_back_keys();
  console.log('algoritm', await openpgp.readKey({ armoredKey: keys.publicKey}));
  const errSignKey = await generate_keys();
  encrypt_pgp({
    pub_encryption_keys: keys.publicKey,
    private_signing_keys: keys.privateKey,
    message: 'sdfsdfsdf',
  }).then((val) => {
    decrypt_pgp({
      encrypted_data: val,
      private_decryption_key: keys.privateKey,
      pub_verification_key: keys.publicKey,
    }).then(console.log);
  })
})

/**
 * Зашифровать
 * @param {Props} p
 */
async function encrypt_pgp(p) {
  const encrypted = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: p.message }),
    encryptionKeys: await openpgp.readKey({ armoredKey: p.pub_encryption_keys }),
    signingKeys: await openpgp.readPrivateKey({ armoredKey: p.private_signing_keys}),
  });

  return encrypted;
}

/**
 * @typedef {Object} Props
 * @prop {string} pub_encryption_keys
 * Публичный ключ тому для кого шифруют
 * @prop {string} private_signing_keys
 * Ваш приватный ключ для подписи
 * @prop {string} message
 * сообщение для шифрования
 */