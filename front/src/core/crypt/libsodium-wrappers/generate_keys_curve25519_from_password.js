// @ts-check

import { sodium } from "../../../libs/sodium.js";



/**
 * генерирует ключи по паролю
 * @param {string} password 
 * @returns 
 */
export async function generate_keys_curve25519_from_password(password) {
    console.log('🔑 generate_keys_curve25519_from_password: Начинаем генерацию ключей...');
    console.log('🔑 Пароль длина:', password?.length, 'символов');
    
    console.log('⏰ Ждем sodium.ready в generate_keys...');
    const sodiumReadyStart = Date.now();
    await sodium.ready; // Убедимся, что библиотека инициализирована
    const sodiumReadyDuration = Date.now() - sodiumReadyStart;
    console.log('✅ sodium.ready в generate_keys завершен за', sodiumReadyDuration, 'мс');

    console.log('🎲 Генерируем соль...');
    const saltStart = Date.now();
    const salt = sodium.randombytes_buf(16); // Генерируем 16 байт соли
    const saltDuration = Date.now() - saltStart;
    console.log('✅ Соль сгенерирована за', saltDuration, 'мс');

    console.log('🔄 Конвертируем пароль в байты...');
    // Используем более универсальный метод crypto_generichash
    const passwordBytes = sodium.from_string(password);
    
    console.log('🔄 Генерируем ключевой материал...');
    const hashStart = Date.now();
    const keyMaterial = sodium.crypto_generichash(32, passwordBytes); // Получаем 32 байта
    const hashDuration = Date.now() - hashStart;
    console.log('✅ Ключевой материал сгенерирован за', hashDuration, 'мс');

    console.log('🔐 Генерируем приватный ключ...');
    const privateKeyStart = Date.now();
    // Теперь используем хэш как секретный ключ
    const privateKey = sodium.crypto_scalarmult_base(keyMaterial);
    const privateKeyDuration = Date.now() - privateKeyStart;
    console.log('✅ Приватный ключ сгенерирован за', privateKeyDuration, 'мс');
    
    console.log('🔐 Генерируем публичный ключ...');
    const publicKeyStart = Date.now();
    const publicKey = sodium.crypto_scalarmult_base(privateKey);
    const publicKeyDuration = Date.now() - publicKeyStart;
    console.log('✅ Публичный ключ сгенерирован за', publicKeyDuration, 'мс');

    console.log('🔄 Конвертируем ключи в hex...');
    const result = {
        privateKey: sodium.to_hex(privateKey),
        publicKey: sodium.to_hex(publicKey),
        salt: sodium.to_hex(salt)
    };
    
    console.log('✅ generate_keys_curve25519_from_password завершен успешно');
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
