const PBKDF2_CONFIG = {
    name: 'PBKDF2',
    iterations: 100000,
    hash: 'SHA-256'
};

/**
 * Generates a random salt for password hashing.
 * @returns {string} Hexadecimal string of the salt.
 */
export const generateSalt = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

/**
 * Hashes a password using PBKDF2 with SHA-256.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} The hashed password in 'salt:hash' format.
 */
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

    const hashBuffer = await crypto.subtle.deriveBits(
        {
            ...PBKDF2_CONFIG,
            salt: salt
        },
        key,
        256
    );

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const saltArray = Array.from(salt);

    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return `${saltHex}:${hashHex}`;
}

/**
 * Constant-time comparison of two Uint8Arrays to prevent timing attacks.
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {boolean} True if arrays are equal.
 */
function constantTimeEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
    }
    return result === 0;
}

/**
 * Verifies a password against a stored hash.
 * @param {string} stored - The stored password hash (or plaintext for legacy).
 * @param {string} password - The password to verify.
 * @returns {Promise<boolean>} True if password matches.
 */
export async function verifyPassword(stored, password) {
    if (!stored) return false;

    // Legacy plaintext support - insecure but necessary for backward compatibility until migrated
    if (!stored.includes(':')) {
        // Warning: Plaintext comparison is not constant time, but needed for legacy.
        // Once migrated, this block should be removed.
        return stored === password;
    }

    const parts = stored.split(':');
    if (parts.length !== 2) return false;

    const [saltHex, originalHashHex] = parts;
    if (!saltHex || !originalHashHex) return false;

    // Safety check for hex validity
    if (!/^[0-9a-fA-F]+$/.test(saltHex) || !/^[0-9a-fA-F]+$/.test(originalHashHex)) {
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

    const hashBuffer = await crypto.subtle.deriveBits(
        {
            ...PBKDF2_CONFIG,
            salt: salt
        },
        key,
        256
    );

    const hashArray = new Uint8Array(hashBuffer);

    // Convert original hash hex back to Uint8Array for constant time comparison
    const originalHashArray = new Uint8Array(originalHashHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    return constantTimeEqual(hashArray, originalHashArray);
}
