import { generateKeyPair } from '@libp2p/crypto/keys';

export const recommendedGenerateKeyPair = () => {
  return generateKeyPair('Ed25519');
}