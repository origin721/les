import * as CryptoJS from "crypto-js";

//console.log({CryptoJS});

export const AES = {
  encrypt,
  decrypt,
};

/**
 * encrypt (зашифровать)
 */
function encrypt(message: string, secretKey: string) {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
}

function decrypt(encrypted: string, secretKey: string) {
  const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey);
  const originalText = decrypted.toString(CryptoJS.enc.Utf8);
  return originalText;
}
