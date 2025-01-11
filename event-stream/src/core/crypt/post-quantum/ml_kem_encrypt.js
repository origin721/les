// @ts-check

const { ml_kem1024 } = require("@noble/post-quantum/ml-kem");
const { stringToUint8Array } = require("../../stringToUint8Array");
const { ml_kem_gen_keys } = require("./ml_kem_gen_keys");
const { uint8ArrayToString } = require("../../uint8ArrayToString");

module.exports = {
  ml_kem_encrypt,
}

ml_kem_encrypt({
  publicKey: ml_kem_gen_keys().publicKey,
  message: 'hi',
})

function ml_kem_encrypt({
  publicKey,
  message,
}) {

  // Сообщение для шифрования
  const messageBytes = stringToUint8Array(message);

  // Шифрование данных с использованием публичного ключа
  const { cipherText, sharedSecret: encryptionKey } = ml_kem1024.encapsulate(publicKey);

  const encryptedMessage = encryptMessage(messageBytes, encryptionKey);

  console.log("Зашифрованное сообщение:", uint8ArrayToString(encryptedMessage));
}

// Симметричное шифрование сообщения
function encryptMessage(messageBytes, key) {
  return messageBytes.map((byte, index) => byte ^ key[index % key.length]);
}
