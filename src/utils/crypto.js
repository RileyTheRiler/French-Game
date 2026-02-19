const PBKDF2_CONFIG = {
    name: 'PBKDF2',
    iterations: 100000,
    hash: 'SHA-256'
};

/**
 * Generates a random salt (hex string).
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
 * @returns {Promise<string>} salt:hash hex string
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
 * Verifies a password against a stored hash.
 * @param {string} stored The stored hash (or legacy plaintext)
 * @param {string} password The input password to verify
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(stored, password) {
    if (!stored || typeof stored !== 'string') return false;

    // Legacy plaintext support - insecure but necessary for backward compatibility until migrated
    if (!stored.includes(':')) {
        // Use timingSafeEqual even for plaintext to avoid timing attacks on length?
        // No, simple string compare is fine for legacy, priority is to migrate away.
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

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const newHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return timingSafeEqual(newHashHex, originalHashHex);
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
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}
