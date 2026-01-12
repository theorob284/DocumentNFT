// frontend/src/crypto.js

export function bytesToHex(bytes) {
  return "0x" + [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(arrayBuffer) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return bytesToHex(new Uint8Array(hashBuffer)); // 0x... 32 bytes => bytes32 compatible
}

export async function encryptAESGCM(arrayBuffer) {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV recommended for GCM

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    arrayBuffer
  );

  const rawKeyBuffer = await crypto.subtle.exportKey("raw", key);

  return {
    ciphertext: new Uint8Array(ciphertextBuffer),
    iv: new Uint8Array(iv),
    rawKey: new Uint8Array(rawKeyBuffer), // DEMO ONLY: keep secret in real life
  };
}
