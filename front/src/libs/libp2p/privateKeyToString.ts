import { privateKeyToProtobuf } from '@libp2p/crypto/keys';
import type { Ed25519PrivateKey } from './Ed25519PrivateKey';

export const privateKeyToString = (
  keyPair: Ed25519PrivateKey
) => {
  const privateKeyProtobuf = privateKeyToProtobuf(keyPair);

  const privateKeyString = btoa(
    // TODO: узнать может ли any быть ошибкой
    String.fromCharCode.apply(null, privateKeyProtobuf as any)
  );

  return privateKeyString;
}