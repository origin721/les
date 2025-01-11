const { ml_kem768, ml_kem1024 } = require('@noble/post-quantum/ml-kem');

// Генерация ключей
const { publicKey, secretKey } = ml_kem768.keygen();

// Шифрование данных с использованием публичного ключа
const { cipherText, sharedSecret: bobShared } = ml_kem768.encapsulate(publicKey);

// Расшифровка данных с использованием приватного ключа
const aliceShared = ml_kem768.decapsulate(cipherText, secretKey);
console.log({aliceShared})

// Проверка, совпадают ли секретные ключи у Алисы и Боба
console.log(aliceShared === bobShared); // Должно вывести true, если обмен прошел успешно
