
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './crypto';

// Helper to generate legacy hash (100k iterations)
async function legacyHashPassword(password) {
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
            iterations: 100000, // Legacy iterations
            hash: 'SHA-256'
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

describe('Crypto Utils', () => {
    it('should hash and verify a password with new format', async () => {
        const password = 'mySecretPassword';
        const hash = await hashPassword(password);
        expect(hash).toBeDefined();

        // Verify new format
        const parts = hash.split(':');
        expect(parts.length).toBe(3);
        expect(parts[0]).toBe('600000'); // Check iteration count

        const isValid = await verifyPassword(hash, password);
        expect(isValid).toBe(true);

        const isInvalid = await verifyPassword(hash, 'wrongPassword');
        expect(isInvalid).toBe(false);
    });

    it('should verify legacy hash (100k iterations)', async () => {
        const password = 'legacyPassword';
        const legacyHash = await legacyHashPassword(password);

        // Verify format is 2 parts
        const parts = legacyHash.split(':');
        expect(parts.length).toBe(2);

        const isValid = await verifyPassword(legacyHash, password);
        expect(isValid).toBe(true);
    });

    it('should verify legacy plaintext password', async () => {
        const password = 'plaintextPassword';
        const isValid = await verifyPassword(password, password);
        expect(isValid).toBe(true);
    });

    it('should fail invalid hash format', async () => {
        const isValid = await verifyPassword('invalid:hash:format:too:long', 'password');
        expect(isValid).toBe(false);
    });
});
