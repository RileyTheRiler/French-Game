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

// Constant-time comparison to prevent timing attacks
function timingSafeEqual(a, b) {
    if (a.byteLength !== b.byteLength) {
        return false;
    }
    const aView = new Uint8Array(a);
    const bView = new Uint8Array(b);
    let result = 0;
    for (let i = 0; i < a.byteLength; i++) {
        result |= aView[i] ^ bView[i];
    }
    return result === 0;
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
            salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        key,
        256
    );

    // Convert stored hashHex back to Uint8Array/ArrayBuffer for comparison
    const originalHash = new Uint8Array(hashHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    return timingSafeEqual(derivedBits, originalHash.buffer);
}
