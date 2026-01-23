const PBKDF2_CONFIG = {
    name: 'PBKDF2',
    iterations: 100000,
    hash: 'SHA-256'
};

// Constant-time string comparison to prevent timing attacks
function constantTimeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }

    // If lengths differ, we can return false immediately as SHA-256 hex is fixed length (64 chars).
    // In a general purpose function, this might leak length, but here the expected hash length is public knowledge.
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

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

export async function verifyPassword(stored, password) {
    if (!stored) return false;
    if (typeof stored !== 'string') return false;

    // Legacy plaintext support - insecure but necessary for backward compatibility
    if (!stored.includes(':')) {
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

    return constantTimeCompare(newHashHex, originalHashHex);
}
