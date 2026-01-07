import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as crypto from '../utils/crypto';

// Mock crypto
vi.mock('../utils/crypto', () => ({
    hashPassword: vi.fn(async (p, s) => `hashed_${p}_${s}`),
    generateSalt: vi.fn(() => 'mock_salt'),
}));

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext Security', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('hashes password on sign up', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current.signUp({ email: 'test@example.com', password: 'secret123' });
        });

        // Check localStorage
        const stored = JSON.parse(localStorage.getItem('frenchApp_credentials'));
        expect(stored['test@example.com']).toBeDefined();
        expect(stored['test@example.com'].hash).toBe('hashed_secret123_mock_salt');
        expect(stored['test@example.com'].salt).toBe('mock_salt');
        expect(stored['test@example.com'].password).toBeUndefined(); // Should not store plain text
    });

    it('verifies password hash on sign in', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        // Setup existing user
        const credentials = {
            'test@example.com': {
                hash: 'hashed_secret123_mock_salt',
                salt: 'mock_salt',
                createdAt: Date.now()
            }
        };
        localStorage.setItem('frenchApp_credentials', JSON.stringify(credentials));

        let user;
        await act(async () => {
            user = await result.current.signIn({ email: 'test@example.com', password: 'secret123' });
        });

        expect(user).toBeDefined();
        expect(user.email).toBe('test@example.com');
        expect(crypto.hashPassword).toHaveBeenCalledWith('secret123', 'mock_salt');
    });

    it('rejects invalid password', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        // Setup existing user
        const credentials = {
            'test@example.com': {
                hash: 'hashed_secret123_mock_salt',
                salt: 'mock_salt',
                createdAt: Date.now()
            }
        };
        localStorage.setItem('frenchApp_credentials', JSON.stringify(credentials));

        await expect(async () => {
            await act(async () => {
                await result.current.signIn({ email: 'test@example.com', password: 'wrong_password' });
            });
        }).rejects.toThrow('Invalid credentials');
    });
});
