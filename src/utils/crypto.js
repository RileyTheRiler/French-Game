const PBKDF2_CONFIG = {
  name: 'PBKDF2',
  iterations: 100000,
  hash: 'SHA-256'
};

// Constant-time string comparison to prevent timing attacks
function constantTimeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

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

  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      ...PBKDF2_CONFIG,
      salt: salt
    },
    key,
    256
  );

  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(stored, password) {
  if (!stored) return false;

  // Legacy plaintext support - insecure but necessary for backward compatibility until migrated
  if (!stored.includes(':')) {
    return stored === password;
  }

  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;

  // Safety check for hex validity
  if (!/^[0-9a-fA-F]+$/.test(saltHex) || !/^[0-9a-fA-F]+$/.test(hashHex)) {
    return false;
  }

  const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      ...PBKDF2_CONFIG,
      salt: salt
    },
    key,
    256
  );

  const derivedHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');

  return constantTimeEqual(derivedHex, hashHex);
}
