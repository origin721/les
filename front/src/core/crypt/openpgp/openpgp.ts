import * as openpgpLib from "openpgp/lightweight";
import { debugLog, forceLog } from "../../debug/logger";

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
  debugLog('OpenPGP тест расшифровки:', decr);
}

type ParamGenerateKeys = {
    name: string;
    pass: string;
    email?: string;
}

async function generateKeys(param: ParamGenerateKeys) {
  forceLog('OpenPGP: Генерация ключей для пользователя:', param.name);
  
  const { privateKey, publicKey } = await openpgpLib.generateKey({
    type: "ecc", // Тип ключа (используем ECC для примера)
    curve: "curve25519", // Кривая для ECC
    userIDs: [{ name: param.name, email: param.email||'d@sdf.sdf' }], // Информация о пользователе
    passphrase: param.pass, // Пароль для шифрования приватного ключа
  });

  forceLog('OpenPGP: Ключи успешно сгенерированы для:', param.name);
  
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
  forceLog('OpenPGP: Начало шифрования и подписания сообщения');
  
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

  forceLog('OpenPGP: Сообщение успешно зашифровано и подписано');
  return encrypted;
}

async function decryptAndVerify(
  encryptedMessage: string,
  secrets: Secret,
) {
  forceLog('OpenPGP: Начало расшифрования и проверки подписи');
  
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

  const isValid = Boolean(await signatures[0].verified);
  
  if (isValid) {
    forceLog("OpenPGP: Подпись проверена и валидна");
  } else {
    forceLog("OpenPGP: КРИТИЧЕСКАЯ ОШИБКА - Подпись невалидна!");
  }

  forceLog('OpenPGP: Расшифрование завершено, подпись валидна:', isValid);

  return {
    message: decrypted,
    isValid,
  }
}



export type Secret = {
  keyPriv: string;
  keyPub: string;
  pass: string;
}
