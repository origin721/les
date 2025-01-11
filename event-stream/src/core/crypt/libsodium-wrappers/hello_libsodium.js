// @ts-check
// Установка libsodium.js
// npm install libsodium-wrappers

const sodium = require('libsodium-wrappers');

async function main() {
  await sodium.ready;

  // Генерация случайного ключа для XChaCha20-Poly1305
  const key = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES);

  // Сообщение для шифрования
  const message = sodium.from_string('Secret Message');

  // Генерация случайного нетривиального nonce
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

  // Шифрование сообщения
  const encrypted = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    message,
    null, // Дополнительные данные (ассоциативные данные)
    'jisfdoiiosdfsdf', // Дополнительные данные (ассоциативные данные)
    nonce,
    key
  );

  console.log('Original Message:', sodium.to_string(message));
  console.log('Encrypted:', sodium.to_base64(encrypted));

  // Проверка наличия зашифрованных данных
  if (!encrypted) {
    throw new Error('Encrypted data is null or undefined');
  }

  // Дешифрование сообщения
  const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    'jisfdoiiosdfsdf',
    encrypted,
    null, // Дополнительные данные (ассоциативные данные)
    nonce,
    key
  );

  if (!decrypted) {
    throw new Error('Decryption failed');
  }

  console.log('Decrypted:', sodium.to_string(decrypted));

  // Генерация пароля с использованием Argon2
  const password = sodium.from_string('mySecurePassword');
  const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
  const opsLimit = sodium.crypto_pwhash_OPSLIMIT_MODERATE;
  const memLimit = sodium.crypto_pwhash_MEMLIMIT_MODERATE;
  const algorithm = sodium.crypto_pwhash_ALG_DEFAULT;

  const hash = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES, // Длина хеша
    password,
    salt,
    opsLimit,
    memLimit,
    algorithm
  );

  console.log('Salt:', sodium.to_base64(salt));
  console.log('Hash:', sodium.to_base64(hash));

  // Проверка пароля
  const passwordHash = sodium.crypto_pwhash_str(
    password,
    opsLimit,
    memLimit
  );

  const verified = sodium.crypto_pwhash_str_verify(
    passwordHash,
    password
  );

  console.log('Password Verified:', verified);
}

main().catch(console.error);