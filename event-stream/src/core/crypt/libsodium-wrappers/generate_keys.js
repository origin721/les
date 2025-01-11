// @ts-check
import sodium from 'libsodium-wrappers';
import { uint8ArrayToString } from '../../uint8ArrayToString.js';


export async function generate_keys() {
  await sodium.ready;

  const keypair = sodium.crypto_box_keypair();
  return {
    privateKey: sodium.to_hex(keypair.privateKey),
    publicKey: sodium.to_hex(keypair.publicKey),
    keyType: keypair.keyType,
  }
}