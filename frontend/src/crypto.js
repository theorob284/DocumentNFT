// frontend/src/crypto.js

export function bytesToHex(bytes) {
  return "0x" + [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}

//This function performs sha256
export async function sha256Hex(arrayBuffer) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return bytesToHex(new Uint8Array(hashBuffer)); // 0x... 32 bytes => bytes32 compatible
}

export async function encryptAESGCM(arrayBuffer) {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 }, true,["encrypt", "decrypt"]);

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV used
  const ciphertextBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv },key,arrayBuffer); // encyrpt cyphertext with iv
  const rawKeyBuffer = await crypto.subtle.exportKey("raw", key); // get the raw key

  return {
    ciphertext: new Uint8Array(ciphertextBuffer),
    iv: new Uint8Array(iv),
    rawKey: new Uint8Array(rawKeyBuffer), // DEMO ONLY: this is kept secret in real life
  };
}

// these functions are to decrypt and download already decrypted documents
export function hexToBytes(hex) {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex; // remove the first 2 digits
  if (clean.length % 2 !== 0) throw new Error("Invalid hex (odd length)"); // must be even
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  } // process of turning hex to bytes
  return out;
}

// this function is to decryptAESGCM
export async function decryptAESGCM(cipherArrayBuffer, ivBytes, rawKeyBytes) {
  const key = await window.crypto.subtle.importKey("raw", rawKeyBytes, { name: "AES-GCM" }, false,["decrypt"]);

  // WebCrypto AES-GCM ciphertext includes auth tag so pass it as-is
  return await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes }, key, cipherArrayBuffer);
}