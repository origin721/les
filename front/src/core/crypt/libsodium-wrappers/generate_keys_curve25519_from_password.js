// @ts-check

import { sodium } from "../../../libs/sodium.js";
import { devCrypto } from "../../debug/logger";



/**
 * генерирует ключи по паролю
 * @param {string} password 
 * @returns 
 */
export async function generate_keys_curve25519_from_password(password) {
    devCrypto('🔑 generate_keys_curve25519_from_password: Начинаем генерацию ключей...');
    devCrypto('🔑 Пароль длина:', password?.length, 'символов');
    
    devCrypto('⏰ Ждем sodium.ready в generate_keys...');
    const sodiumReadyStart = Date.now();
    await sodium.ready; // Убедимся, что библиотека инициализирована
    const sodiumReadyDuration = Date.now() - sodiumReadyStart;
    devCrypto('✅ sodium.ready в generate_keys завершен за', sodiumReadyDuration, 'мс');

    devCrypto('🎲 Генерируем соль...');
    const saltStart = Date.now();
    const salt = sodium.randombytes_buf(16); // Генерируем 16 байт соли
    const saltDuration = Date.now() - saltStart;
    devCrypto('✅ Соль сгенерирована за', saltDuration, 'мс');

    devCrypto('🔄 Конвертируем пароль в байты...');
    // Используем более универсальный метод crypto_generichash
    const passwordBytes = sodium.from_string(password);
    
    devCrypto('🔄 Генерируем ключевой материал...');
    const hashStart = Date.now();
    const keyMaterial = sodium.crypto_generichash(32, passwordBytes, null); // Получаем 32 байта
    const hashDuration = Date.now() - hashStart;
    devCrypto('✅ Ключевой материал сгенерирован за', hashDuration, 'мс');

    devCrypto('🔐 Генерируем приватный ключ...');
    const privateKeyStart = Date.now();
    // Теперь используем хэш как секретный ключ
    const privateKey = sodium.crypto_scalarmult_base(keyMaterial);
    const privateKeyDuration = Date.now() - privateKeyStart;
    devCrypto('✅ Приватный ключ сгенерирован за', privateKeyDuration, 'мс');
    
    devCrypto('🔐 Генерируем публичный ключ...');
    const publicKeyStart = Date.now();
    const publicKey = sodium.crypto_scalarmult_base(privateKey);
    const publicKeyDuration = Date.now() - publicKeyStart;
    devCrypto('✅ Публичный ключ сгенерирован за', publicKeyDuration, 'мс');

    devCrypto('🔄 Конвертируем ключи в hex...');
    const result = {
        privateKey: sodium.to_hex(privateKey),
        publicKey: sodium.to_hex(publicKey),
        salt: sodium.to_hex(salt)
    };
    
    devCrypto('✅ generate_keys_curve25519_from_password завершен успешно');
    return result;
}

// Пример вызова функции
// (async () => {
//     const password = "super_secret_password";
//     const { privateKey, publicKey, salt } = await generate_keys_curve25519_from_password(password);

//     console.log("Salt:", salt);
//     console.log("Private Key:", privateKey);
//     console.log("Public Key:", publicKey);
// })();
