const openpgp = require('openpgp');

const generateKeys = async () => {
  const { privateKey, publicKey } = await openpgp.generateKey({
    userIDs: [{ name: 'example' }],
    curve: 'ed25519',
  });

  console.log("Public Key:", publicKey);
  console.log("Private Key:", privateKey);
};

generateKeys();