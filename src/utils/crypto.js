const PBKDF2_CONFIG = {
    name: 'PBKDF2',
    iterations: 100000,
    hash: 'SHA-256'
};

/**
 * Generates a random salt.
 * @returns {string} Hex string of salt
 */
export const generateSalt = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

/**
 * Hashes a password using PBKDF2.
 * @param {string} password
 * @returns {Promise<string>} format: "salt:hash"
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
 * Constant-time string comparison to prevent timing attacks.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function timingSafeEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

/**
 * Verifies a password against a stored hash.
 * @param {string} storedHash format "salt:hash" or legacy plaintext
 * @param {string} password
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(storedHash, password) {
    if (!storedHash) return false;
    if (typeof storedHash !== 'string') return false;

    // Legacy plaintext support - insecure but necessary for backward compatibility
    if (!storedHash.includes(':')) {
        return storedHash === password;
    }

    const parts = storedHash.split(':');
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

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const newHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return timingSafeEqual(newHashHex, originalHashHex);
}
