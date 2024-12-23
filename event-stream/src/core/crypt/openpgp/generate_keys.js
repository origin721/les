// @ts-check

const openpgp = require('openpgp');

module.exports = {
  generate_keys,
};

async function generate_keys () {
  const { privateKey, publicKey } = await openpgp.generateKey({
    userIDs: [{ name: 'example' }],
    curve: 'ed25519Legacy',
    //curve: 'ed25519',
  });

  return {
    privateKey,
    publicKey,
  }
};