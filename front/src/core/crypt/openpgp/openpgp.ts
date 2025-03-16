import * as openpgpLib from "openpgp/lightweight";

export const openpgp = {
  encrypt: encryptAndSign,
  decrypt: decryptAndVerify,
  generateKey: generateKeys,
};


// main();
async function main() {
  const secrets = await generateKeys({
    name: 'aasd',
    pass: 'jsdfio3390',
  });

  const encMessage = await encryptAndSign('messssage', secrets); 
  const decr = await decryptAndVerify(encMessage.toString(), secrets);
  console.log({decr});
}

type ParamGenerateKeys = {
    name: string;
    pass: string;
    email?: string;
}

async function generateKeys(param: ParamGenerateKeys) {
  const { privateKey, publicKey } = await openpgpLib.generateKey({
    type: "ecc", // Тип ключа (используем ECC для примера)
    curve: "curve25519", // Кривая для ECC
    userIDs: [{ name: param.name, email: param.email||'d@sdf.sdf' }], // Информация о пользователе
    passphrase: param.pass, // Пароль для шифрования приватного ключа
  });

  return {
    keyPriv: privateKey,
    keyPub: publicKey,
    pass: param.pass,
  };
}

async function encryptAndSign(
  message: string, 
  secrets: Secret,
) {
  // Загрузка ключей
  const pubKey = await openpgpLib.readKey({ armoredKey: secrets.keyPub });
  const privKey = await openpgpLib.decryptKey({
    privateKey: await openpgpLib.readPrivateKey({ armoredKey: secrets.keyPriv }),
    passphrase: secrets.pass,
  });

  // Шифрование и подписание
  const encrypted = await openpgpLib.encrypt({
    message: await openpgpLib.createMessage({ text: message }),
    encryptionKeys: pubKey,
    signingKeys: privKey,
    format: "armored",
  });

  // console.log("Зашифрованное сообщение:", encrypted);
  return encrypted;
}

async function decryptAndVerify(
  encryptedMessage: string,
  secrets: Secret,
) {
  // Загрузка ключей
  const pubKey = await openpgpLib.readKey({ armoredKey: secrets.keyPub });
  const privKey = await openpgpLib.decryptKey({
    privateKey: await openpgpLib.readPrivateKey({ armoredKey: secrets.keyPriv }),
    passphrase: secrets.pass,
  });

  // Расшифрование и проверка подписи
  const { data: decrypted, signatures } = await openpgpLib.decrypt({
    message: await openpgpLib.readMessage({ armoredMessage: encryptedMessage }),
    decryptionKeys: privKey,
    verificationKeys: pubKey,
  });

  // console.log("Расшифрованное сообщение:", decrypted);

  return {
    message: decrypted,
    isValid: Boolean(await signatures[0].verified),
  }

  const valid = await signatures[0].verified;
  if (valid) {
    console.log("Подпись проверена и валидна.");
  } else {
    console.log("Подпись невалидна.");
  }
}

// /**
//  * encrypt (зашифровать)
//  */
// function encrypt(message: string, secretKey: string) {}

// function decrypt(encrypted: string, secretKey: string) {}

// /**
//  * GenKey
//  */
// async function generateKey() {
//     await sleep(3000);
//     console.log('startGenerate')
//     const val = await generateKey({ curve: 'brainpoolP512r1',  userIDs: [{ name: 'Test', email: 'test@test.com' }] });
//     console.log({ val });
//     return 'sdfsdf'
// }


export type Secret = {
  keyPriv: string;
  keyPub: string;
  pass: string;
}