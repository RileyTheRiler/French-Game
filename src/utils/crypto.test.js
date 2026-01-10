
import { describe, it, expect } from 'vitest';
import { generateSalt, hashPassword, verifyPassword } from './crypto';

describe('Crypto Utils', () => {
    it('should generate a random salt', () => {
        const salt1 = generateSalt();
        const salt2 = generateSalt();
        expect(salt1).toHaveLength(32); // 16 bytes * 2 chars/byte
        expect(salt2).toHaveLength(32);
        expect(salt1).not.toBe(salt2);
    });

    it('should hash a password consistently', async () => {
        const password = 'mySecretPassword';
        const salt = generateSalt();
        const hash1 = await hashPassword(password, salt);
        const hash2 = await hashPassword(password, salt);
        expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different salts', async () => {
        const password = 'mySecretPassword';
        const salt1 = generateSalt();
        const salt2 = generateSalt();
        const hash1 = await hashPassword(password, salt1);
        const hash2 = await hashPassword(password, salt2);
        expect(hash1).not.toBe(hash2);
    });

    it('should verify a correct password', async () => {
        const password = 'correctPassword';
        const salt = generateSalt();
        const hash = await hashPassword(password, salt);
        const isValid = await verifyPassword(password, salt, hash);
        expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
        const password = 'correctPassword';
        const salt = generateSalt();
        const hash = await hashPassword(password, salt);
        const isValid = await verifyPassword('wrongPassword', salt, hash);
        expect(isValid).toBe(false);
    });
});
