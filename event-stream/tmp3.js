// @ts-check
const { ml_kem1024 } = require('@noble/post-quantum/ml-kem');




// Расшифровка данных с использованием приватного ключа
const decryptionKey = ml_kem1024.decapsulate(cipherText, secretKey);

if (encryptionKey.toString() === decryptionKey.toString()) {
  console.log("Ключи совпадают! Можно расшифровать сообщение.");
} else {
  console.error("Ключи не совпадают! Невозможно расшифровать сообщение.");
}

// Симметричное расшифрование сообщения
function decryptMessage(encryptedBytes, key) {
  return encryptedBytes.map((byte, index) => byte ^ key[index % key.length]);
}

const decryptedMessageBytes = decryptMessage(encryptedMessage, decryptionKey);
const decryptedMessage = uint8ArrayToString(decryptedMessageBytes);

console.log("Расшифрованное сообщение:", decryptedMessage);
