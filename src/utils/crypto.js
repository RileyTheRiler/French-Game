
/**
 * Cryptographic utilities using Web Crypto API
 * Implements PBKDF2 with SHA-256 for secure password hashing.
 */

/**
 * Generates a random salt (16 bytes)
 * @returns {string} Hex string of the salt
 */
export const generateSalt = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

/**
 * Hashes a password with a salt using PBKDF2
 * @param {string} password
 * @param {string} salt (hex string)
 * @returns {Promise<string>} Hex string of the hash
 */
export const hashPassword = async (password, salt) => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    // Convert hex salt back to Uint8Array
    const saltBuffer = new Uint8Array(
        salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );

    const derivedBits = await window.crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: saltBuffer,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    );

    return Array.from(new Uint8Array(derivedBits))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

/**
 * Verifies a password against a stored hash and salt
 * @param {string} password
 * @param {string} salt
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
export const verifyPassword = async (password, salt, storedHash) => {
    const hash = await hashPassword(password, salt);
    return hash === storedHash;
};
