import sodium from 'libsodium-wrappers';

async function main() {
    await sodium.ready;

    // Генерация пары ключей для подписи
    const keyPair = sodium.crypto_sign_keypair();

    console.log('Public key:', sodium.to_hex(keyPair.publicKey));
    console.log('Private key:', sodium.to_hex(keyPair.privateKey));

    // Сообщение
    const message = 'Это сообщение необходимо подписать';

    // Создание подписи
    const signedMessage = sodium.crypto_sign(message, keyPair.privateKey);

    console.log('Signed message:', sodium.to_hex(signedMessage));

    // Проверка подписи
    const verifiedMessage = sodium.crypto_sign_open(signedMessage, keyPair.publicKey);

    if (verifiedMessage !== null) {
        console.log('Verified message:', sodium.to_string(verifiedMessage));
        console.log('Подпись корректна!');
    } else {
        console.log('Подпись недействительна!');
    }
}

main().catch(console.error);
