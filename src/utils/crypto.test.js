
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './crypto';

describe('Crypto Utils', () => {
    it('should hash a password and return a iterations:salt:hash string', async () => {
        const password = 'mySecretPassword';
        const hashedPassword = await hashPassword(password);

        expect(hashedPassword).toContain(':');
        const parts = hashedPassword.split(':');
        expect(parts.length).toBe(3);

        const [iterations, salt, hash] = parts;
        expect(iterations).toBe('600000');
        expect(salt.length).toBeGreaterThan(0);
        expect(hash.length).toBeGreaterThan(0);
    });

    it('should verify a correct password', async () => {
        const password = 'mySecretPassword';
        const hashedPassword = await hashPassword(password);
        const isValid = await verifyPassword(hashedPassword, password);

        expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
        const password = 'mySecretPassword';
        const hashedPassword = await hashPassword(password);
        const isValid = await verifyPassword(hashedPassword, 'wrongPassword');

        expect(isValid).toBe(false);
    });

    it('should handle legacy plaintext passwords correctly', async () => {
        const legacyPassword = 'legacyPassword123';
        const isValid = await verifyPassword(legacyPassword, legacyPassword);
        expect(isValid).toBe(true);

        const isInvalid = await verifyPassword(legacyPassword, 'wrongLegacy');
        expect(isInvalid).toBe(false);
    });

    it('should return false for invalid stored format', async () => {
        const isValid = await verifyPassword('invalidFormat', 'somePassword');
        // 'invalidFormat' doesn't have a colon, so it falls back to plaintext check
        // 'invalidFormat' !== 'somePassword' => false
        expect(isValid).toBe(false);
    });

    it('should verify legacy 100k iteration hashes', async () => {
        // Helper to create a legacy hash (100k iterations, salt:hash format)
        async function createLegacyHash(password) {
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
                    iterations: 100000,
                    hash: 'SHA-256',
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

        const password = 'legacySecret';
        const legacyHash = await createLegacyHash(password);

        const isValid = await verifyPassword(legacyHash, password);
        expect(isValid).toBe(true);

        const isInvalid = await verifyPassword(legacyHash, 'wrong');
        expect(isInvalid).toBe(false);
    });
});
