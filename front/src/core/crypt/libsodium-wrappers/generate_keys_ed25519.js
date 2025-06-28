// @ts-check
import sodium from 'libsodium-wrappers';

export async function generate_keys_ed25519() {
  await sodium.ready;

  const keypair = sodium.crypto_sign_keypair();
  return {
    privateKey: sodium.to_hex(keypair.privateKey),
    publicKey: sodium.to_hex(keypair.publicKey),
    keyType: keypair.keyType,
  }
}
