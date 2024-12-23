const { ml_dsa65 } = require('@noble/post-quantum/ml-dsa');

// Строка для подписи
const message = 'hisdfiosdf';

// Генерация ключей
const seed = new TextEncoder().encode('secure_random_seed'); // Замените на безопасное значение!
const { publicKey, secretKey } = ml_dsa65.keygen(seed);

// Преобразуем ключи в строку (к примеру, в base64)
const publicKeyStr = Buffer.from(publicKey).toString('base64');
const secretKeyStr = Buffer.from(secretKey).toString('base64');

// Выводим строковые представления ключей
console.log('PublicKey (Base64):', publicKeyStr);
console.log('SecretKey (Base64):', secretKeyStr);

// Теперь преобразуем обратно из строки в Uint8Array
const publicKeyFromStr = Uint8Array.from(Buffer.from(publicKeyStr, 'base64'));
const secretKeyFromStr = Uint8Array.from(Buffer.from(secretKeyStr, 'base64'));

console.log({ publicKey, secretKey });

// Преобразование строки в байты
const messageBytes = new TextEncoder().encode(message);

// Подписание сообщения
const signature = ml_dsa65.sign(secretKey, messageBytes);

// Проверка подписи
const isValid = ml_dsa65.verify(publicKey, messageBytes, signature);

// Вывод результатов
console.log('Message:', message);
console.log('Signature:', Buffer.from(signature).toString('hex')); // Подпись в виде строки HEX
console.log('Is the signature valid?', isValid ? 'Yes' : 'No');
