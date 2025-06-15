import { generateKeyPair } from '@libp2p/crypto/keys';

export type Ed25519PrivateKey = Awaited<ReturnType<typeof generateKeyPair>>;