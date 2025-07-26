// @ts-check
import sodium from 'libsodium-wrappers';
import { generate_keys_curve25519_from_password } from './generate_keys_curve25519_from_password';
import { devCrypto, prodError } from "../../debug/logger";

// TODO: можно будет сделать 
// encrypt_curve25519_from_pass_with_verify
// которая будет тоже с строкой работать но и с проверкой подписи
/**
 * @typedef {Object} Props
 * @prop {string} pass
 * @prop {string} message
 */
/**
 * @param {Props} param0 
 */
export async function encrypt_curve25519_from_pass({
  pass,
  message,
}) {
  try {
    devCrypto('🔐 encrypt_curve25519_from_pass: Начинаем шифрование...');
    devCrypto('🔐 Размер пароля:', pass?.length, 'символов');
    devCrypto('🔐 Размер сообщения:', message?.length, 'символов');
    
    devCrypto('⏰ Ждем sodium.ready...');
    const sodiumReadyStart = Date.now();
    await sodium.ready;
    const sodiumReadyDuration = Date.now() - sodiumReadyStart;
    devCrypto('✅ sodium.ready завершен за', sodiumReadyDuration, 'мс');

    devCrypto('🔑 Генерируем ключи из пароля...');
    const keyGenStart = Date.now();
    const {
      publicKey: receiverPublicKey,
    } = await generate_keys_curve25519_from_password(pass);
    const keyGenDuration = Date.now() - keyGenStart;
    devCrypto('✅ Ключи сгенерированы за', keyGenDuration, 'мс');

    devCrypto('🔄 Обрабатываем ключ...');
    const _receiverPublicKey = typeof receiverPublicKey === 'string'
      ? sodium.from_hex(receiverPublicKey)
      : receiverPublicKey;

    devCrypto('📝 Конвертируем сообщение...');
    // Сообщение для шифрования
    const _message = sodium.from_string(message);

    devCrypto('🔐 Выполняем crypto_box_seal...');
    const encryptStart = Date.now();
    // Шифрование (отправитель использует свой приватный и публичный ключ получателя)
    const cipherText = sodium.crypto_box_seal(
      _message,               // Сообщение
      _receiverPublicKey,     // Публичный ключ получателя .publicKey
    );
    const encryptDuration = Date.now() - encryptStart;
    devCrypto('✅ crypto_box_seal завершен за', encryptDuration, 'мс');

    devCrypto('🔄 Конвертируем в hex...');
    const result = sodium.to_hex(cipherText);
    devCrypto('✅ encrypt_curve25519_from_pass завершен успешно, размер результата:', result?.length);
    
    return result;

  }
  catch(err) {
    prodError('❌ Ошибка в encrypt_curve25519_from_pass:', err);
    return null;
  }
}
