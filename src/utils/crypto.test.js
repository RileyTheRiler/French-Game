import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateSalt } from './crypto';

describe('Crypto Utils', () => {
    it('should generate a unique salt', () => {
        const salt1 = generateSalt();
        const salt2 = generateSalt();
        expect(salt1).not.toBe(salt2);
        expect(salt1.length).toBe(32); // 16 bytes * 2 hex chars
    });

    it('should hash a password and return a salt:hash string', async () => {
        const password = 'mySecretPassword';
        const hashedPassword = await hashPassword(password);

        expect(hashedPassword).toContain(':');
        const [salt, hash] = hashedPassword.split(':');
        expect(salt.length).toBeGreaterThan(0);
        expect(hash.length).toBeGreaterThan(0);
    });

    it('should verify a correct hashed password', async () => {
        const password = 'mySecretPassword';
        const hashedPassword = await hashPassword(password);
        const isValid = await verifyPassword(hashedPassword, password);

        expect(isValid).toBe(true);
    });

    it('should reject an incorrect password against a hash', async () => {
        const password = 'mySecretPassword';
        const hashedPassword = await hashPassword(password);
        const isValid = await verifyPassword(hashedPassword, 'wrongPassword');

        expect(isValid).toBe(false);
    });

    it('should handle legacy plaintext passwords correctly (backward compatibility)', async () => {
        const legacyPassword = 'legacyPassword123';
        // When stored is just plaintext (no colon), it should compare directly
        const isValid = await verifyPassword(legacyPassword, legacyPassword);
        expect(isValid).toBe(true);

        const isInvalid = await verifyPassword(legacyPassword, 'wrongLegacy');
        expect(isInvalid).toBe(false);
    });

    it('should return false for invalid stored hash format', async () => {
        // Empty
        expect(await verifyPassword('', 'pass')).toBe(false);
        // Null
        expect(await verifyPassword(null, 'pass')).toBe(false);
        // Malformed hex in salt
        expect(await verifyPassword('zz:1234', 'pass')).toBe(false);
    });

    it('should produce different hashes for same password due to salt', async () => {
        const password = 'samePassword';
        const hash1 = await hashPassword(password);
        const hash2 = await hashPassword(password);

        expect(hash1).not.toBe(hash2);

        // But both should verify
        expect(await verifyPassword(hash1, password)).toBe(true);
        expect(await verifyPassword(hash2, password)).toBe(true);
    });
});
