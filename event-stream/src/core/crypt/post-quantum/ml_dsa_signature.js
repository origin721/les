// @ts-check

const { ml_dsa65 } = require("@noble/post-quantum/ml-dsa");

module.exports = {
  ml_dsa_signature,
}

function ml_dsa_signature({
  message,
  secretKey,
}) {
  // Преобразование строки в байты
  const messageBytes = new TextEncoder().encode(message);

  // Подписание сообщения
  const signature = ml_dsa65.sign(secretKey, messageBytes);

  return signature;
}