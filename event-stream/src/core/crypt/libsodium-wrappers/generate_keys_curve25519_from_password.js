// @ts-check

import { sodium } from "../../../libs/index.js";
//import sodium from "libsodium-wrappers";



/**
 * генерирует ключи по паролю
 * @param {string} password 
 * @returns 
 */
export async function generate_keys_curve25519_from_password(password) {
    await sodium.ready; // Убедимся, что библиотека инициализирована

    const salt = sodium.randombytes_buf(16); // Генерируем 16 байт соли

    // Используем более универсальный метод crypto_generichash
    const passwordBytes = sodium.from_string(password);
    const keyMaterial = sodium.crypto_generichash(32, passwordBytes); // Получаем 32 байта

    // Теперь используем хэш как секретный ключ
    const privateKey = sodium.crypto_scalarmult_base(keyMaterial);
    const publicKey = sodium.crypto_scalarmult_base(privateKey);

    return {
        privateKey: sodium.to_hex(privateKey),
        publicKey: sodium.to_hex(publicKey),
        salt: sodium.to_hex(salt)
    };
}

// Пример вызова функции
// (async () => {
//     const password = "super_secret_password";
//     const { privateKey, publicKey, salt } = await generate_keys_curve25519_from_password(password);

//     console.log("Salt:", salt);
//     console.log("Private Key:", privateKey);
//     console.log("Public Key:", publicKey);
// })();
