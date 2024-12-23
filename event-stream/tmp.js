// @ts-check
const { ml_kem512, ml_kem768, ml_kem1024 } = require('@noble/post-quantum/ml-kem');
// [Alice] generates secret & public keys, then sends publicKey to Bob
const aliceKeys = ml_kem768.keygen();
const alicePub = aliceKeys.publicKey;

// [Bob] generates shared secret for Alice publicKey
// bobShared never leaves [Bob] system and is unknown to other parties
const { cipherText, sharedSecret: bobShared } = ml_kem768.encapsulate(alicePub);

// Alice gets and decrypts cipherText from Bob
const aliceShared = ml_kem768.decapsulate(cipherText, aliceKeys.secretKey);

// Now, both Alice and Both have same sharedSecret key
// without exchanging in plainText: aliceShared == bobShared

// Warning: Can be MITM-ed
const carolKeys = ml_kem768.keygen();
const carolShared = ml_kem768.decapsulate(cipherText, carolKeys.secretKey); // No error!
console.log({aliceShared, carolShared})
//notDeepStrictEqual(aliceShared, carolShared); // Different key!