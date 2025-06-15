import { privateKeyFromProtobuf } from '@libp2p/crypto/keys';

export const privateKeyFromString = (
  privateKeyString: string,
) => {
  // Преобразование строки Base64 обратно в Uint8Array
  const binaryString = atob(privateKeyString);
  const uint8Array = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  return privateKeyFromProtobuf(uint8Array);
}