
/**
 * Simple client-side cryptographic utilities.
 * NOTE: Client-side hashing alone does not protect against all attacks (e.g., modified client code),
 * but it prevents storing plain-text passwords in local storage.
 */

/**
 * Hashes a string using SHA-256.
 * @param {string} message - The string to hash.
 * @returns {Promise<string>} - The hexadecimal representation of the hash.
 */
export async function hashPassword(message) {
    if (!message) return '';
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
