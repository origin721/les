import { privateKeyFromString } from "./privateKeyFromString";
import { peerIdFromPrivateKey } from '@libp2p/peer-id'

export const privateKeyStringToPeerId = (
  privateKeyString: string,
) => {
  const privKey = privateKeyFromString(privateKeyString);
  return peerIdFromPrivateKey(privKey);
}