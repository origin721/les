import sodium from 'libsodium-wrappers';

(async () => {
  await sodium.ready;

  // Генерация ключей отправителя
  const senderKeyPair = sodium.crypto_box_keypair();
  console.log("Sender Private Key:", sodium.to_base64(senderKeyPair.privateKey));
  console.log("Sender Public Key:", sodium.to_base64(senderKeyPair.publicKey));

  // Генерация ключей получателя
  const receiverKeyPair = sodium.crypto_box_keypair();
  console.log("Receiver Private Key:", sodium.to_base64(receiverKeyPair.privateKey));
  console.log("Receiver Public Key:", sodium.to_base64(receiverKeyPair.publicKey));

  // Сообщение для шифрования
  const message = sodium.from_string("Hello, Curve25519!");

  // Генерация случайного nonce (вектор инициализации)
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

  // Шифрование (отправитель использует свой приватный и публичный ключ получателя)
  const cipherText = sodium.crypto_box_easy(
    message,                       // Сообщение
    nonce,                         // Nonce
    receiverKeyPair.publicKey,     // Публичный ключ получателя
    senderKeyPair.privateKey       // Приватный ключ отправителя
  );
  console.log("CipherText (Base64):", sodium.to_base64(cipherText));
  console.log("Nonce (Base64):", sodium.to_base64(nonce));

  // Расшифровка (получатель использует свой приватный и публичный ключ отправителя)
  const decryptedMessage = sodium.crypto_box_open_easy(
    cipherText,                    // Зашифрованное сообщение
    nonce,                         // Nonce
    senderKeyPair.publicKey,       // Публичный ключ отправителя
    receiverKeyPair.privateKey     // Приватный ключ получателя
  );

  console.log("Decrypted Message:", sodium.to_string(decryptedMessage));
})();
