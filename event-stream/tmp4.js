const sodium = require('libsodium-wrappers');

async function main() {
    await sodium.ready;

    // Генерация пары ключей для отправителя и получателя
    const senderKeyPair = sodium.crypto_box_keypair();
    const receiverKeyPair = sodium.crypto_box_keypair();

    console.log('Sender public key:', sodium.to_hex(senderKeyPair.publicKey));
    console.log('Receiver public key:', sodium.to_hex(receiverKeyPair.publicKey));

    // Сообщение для шифрования
    const message = 'Это секретное сообщение';

    // Генерация случайного nonce (однократный ключ)
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

    // Шифрование
    const encryptedMessage = sodium.crypto_box_easy(
        message,
        nonce,
        receiverKeyPair.publicKey,
        senderKeyPair.privateKey
    );

    console.log('Encrypted message:', sodium.to_hex(encryptedMessage));

    // Расшифрование
    const decryptedMessage = sodium.crypto_box_open_easy(
        encryptedMessage,
        nonce,
        senderKeyPair.publicKey,
        receiverKeyPair.privateKey
    );

    console.log('Decrypted message:', sodium.to_string(decryptedMessage));
}

main().catch(console.error);
