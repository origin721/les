// @ts-check
import sodium from 'libsodium-wrappers';
import { generate_keys_curve25519_from_password } from './generate_keys_curve25519_from_password';

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
    console.log('🔐 encrypt_curve25519_from_pass: Начинаем шифрование...');
    console.log('🔐 Размер пароля:', pass?.length, 'символов');
    console.log('🔐 Размер сообщения:', message?.length, 'символов');
    
    console.log('⏰ Ждем sodium.ready...');
    const sodiumReadyStart = Date.now();
    await sodium.ready;
    const sodiumReadyDuration = Date.now() - sodiumReadyStart;
    console.log('✅ sodium.ready завершен за', sodiumReadyDuration, 'мс');

    console.log('🔑 Генерируем ключи из пароля...');
    const keyGenStart = Date.now();
    const {
      publicKey: receiverPublicKey,
    } = await generate_keys_curve25519_from_password(pass);
    const keyGenDuration = Date.now() - keyGenStart;
    console.log('✅ Ключи сгенерированы за', keyGenDuration, 'мс');

    console.log('🔄 Обрабатываем ключ...');
    const _receiverPublicKey = typeof receiverPublicKey === 'string'
      ? sodium.from_hex(receiverPublicKey)
      : receiverPublicKey;

    console.log('📝 Конвертируем сообщение...');
    // Сообщение для шифрования
    const _message = sodium.from_string(message);

    console.log('🔐 Выполняем crypto_box_seal...');
    const encryptStart = Date.now();
    // Шифрование (отправитель использует свой приватный и публичный ключ получателя)
    const cipherText = sodium.crypto_box_seal(
      _message,               // Сообщение
      _receiverPublicKey,     // Публичный ключ получателя .publicKey
    );
    const encryptDuration = Date.now() - encryptStart;
    console.log('✅ crypto_box_seal завершен за', encryptDuration, 'мс');

    console.log('🔄 Конвертируем в hex...');
    const result = sodium.to_hex(cipherText);
    console.log('✅ encrypt_curve25519_from_pass завершен успешно, размер результата:', result?.length);
    
    return result;

  }
  catch(err) {
    console.error('❌ Ошибка в encrypt_curve25519_from_pass:', err);
    return null;
  }
}
