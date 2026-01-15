
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './crypto';

describe('Crypto Utils', () => {
    it('should hash a password and return a salt:hash string', async () => {
        const password = 'mySecretPassword';
        const hashedPassword = await hashPassword(password);

        expect(hashedPassword).toContain(':');
        const [salt, hash] = hashedPassword.split(':');
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
});
