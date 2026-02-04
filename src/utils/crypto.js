const PBKDF2_CONFIG = {
    name: 'PBKDF2',
    iterations: 100000,
    hash: 'SHA-256'
};

// Generate a random salt (exported helper)
export const generateSalt = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', data, { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );

  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${saltHex}:${hashHex}`;
}

// Constant-time string comparison to prevent timing attacks
export function constantTimeEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}

export async function verifyPassword(stored, password) {
  if (!stored) return false;
  // Legacy plaintext support - insecure but necessary for backward compatibility until migrated
  if (!stored.includes(':')) {
    // Note: Plaintext comparison is inherently not constant time relative to a hash check,
    // but we can't do much about it here without breaking legacy.
    return stored === password;
  }

  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;

  const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const key = await crypto.subtle.importKey('raw', data, { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );

  const derivedHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');

  return constantTimeEqual(derivedHex, hashHex);
}
