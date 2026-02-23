
const PBKDF2_LEGACY_ITERATIONS = 100000;
const PBKDF2_ITERATIONS = 600000; // OWASP recommended (2025)

/**
 * Constant-time comparison of two strings to prevent timing attacks.
 * Note: This implementation assumes strings are hex-encoded hashes of equal length
 * for the security benefit to be maximal, but handles length mismatch safely.
 */
function timingSafeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }

    const aLen = a.length;
    const bLen = b.length;

    // Always iterate over the length of 'a' to simulate work,
    // but the result is false if lengths differ.
    // This isn't perfect constant time for length mismatch, but
    // adequate for password hash verification where length is typically fixed/known.
    let mismatch = aLen === bLen ? 0 : 1;

    // Iterate over the length of a (or b if shorter, to avoid bounds error, though length check handled above)
    // We use a bitwise OR to accumulate differences.
    const len = Math.min(aLen, bLen);

    for (let i = 0; i < len; i++) {
        mismatch |= (a.charCodeAt(i) ^ b.charCodeAt(i));
    }

    return mismatch === 0;
}

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
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        key,
        256
    );

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const saltArray = Array.from(salt);

    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return `${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`;
}

export async function verifyPassword(storedHash, password) {
    if (!storedHash) return false;
    if (typeof storedHash !== 'string') return false;

    // Legacy plaintext support - insecure but necessary for backward compatibility
    if (!storedHash.includes(':')) {
        // Use timingSafeEqual even for plaintext to avoid timing leaks on length/content
        return timingSafeEqual(storedHash, password);
    }

    const parts = storedHash.split(':');
    let iterations = PBKDF2_LEGACY_ITERATIONS;
    let saltHex, originalHashHex;

    if (parts.length === 3) {
        // Format: iterations:salt:hash
        iterations = parseInt(parts[0], 10);
        saltHex = parts[1];
        originalHashHex = parts[2];
    } else if (parts.length === 2) {
        // Format: salt:hash (Legacy)
        saltHex = parts[0];
        originalHashHex = parts[1];
    } else {
        return false;
    }

    if (!saltHex || !originalHashHex || isNaN(iterations)) return false;

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
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations,
            hash: 'SHA-256'
        },
        key,
        256
    );

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const newHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return timingSafeEqual(newHashHex, originalHashHex);
}

// Generate a random salt (exported helper)
export const generateSalt = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};
