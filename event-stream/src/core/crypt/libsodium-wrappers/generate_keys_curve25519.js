// @ts-check
import { sodium } from '../../../libs/index.js';


export async function generate_keys_curve25519() {
  await sodium.ready;

  const keypair = sodium.crypto_box_keypair();
  return {
    privateKey: sodium.to_hex(keypair.privateKey),
    publicKey: sodium.to_hex(keypair.publicKey),
    keyType: keypair.keyType,
  }
}