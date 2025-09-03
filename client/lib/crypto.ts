import nacl from 'tweetnacl';

export function generateSymmetricKey(): Uint8Array {
  const key = new Uint8Array(32);
  crypto.getRandomValues(key);
  return key;
}

export async function encryptFile(data: ArrayBuffer, key: Uint8Array) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['encrypt']);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
  return { iv, data: new Uint8Array(encrypted) };
}

export async function decryptFile(encrypted: Uint8Array, key: Uint8Array, iv: Uint8Array) {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['decrypt']);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, encrypted);
  return new Uint8Array(decrypted);
}

export function wrapKey(key: Uint8Array, recipientPublicKey: Uint8Array, senderSecretKey: Uint8Array) {
  const nonce = nacl.randomBytes(24);
  const wrapped = nacl.box(key, nonce, recipientPublicKey, senderSecretKey);
  return { nonce, wrapped };
}

export function unwrapKey(wrapped: Uint8Array, nonce: Uint8Array, senderPublicKey: Uint8Array, recipientSecretKey: Uint8Array) {
  const unwrapped = nacl.box.open(wrapped, nonce, senderPublicKey, recipientSecretKey);
  if (!unwrapped) throw new Error('Failed to unwrap key');
  return unwrapped;
}
