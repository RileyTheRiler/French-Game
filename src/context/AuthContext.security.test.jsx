
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Test component to access context
const TestComponent = () => {
    const { signIn, signUp, user, error } = useAuth();

    return (
        <div>
            <div data-testid="user-id">{user?.id}</div>
            <div data-testid="error">{error}</div>
            <button onClick={() => signUp({ email: 'test@example.com', password: 'password123' })}>
                Sign Up
            </button>
            <button onClick={() => signIn({ email: 'test@example.com', password: 'password123' })}>
                Sign In
            </button>
        </div>
    );
};

describe('AuthContext Security', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should hash password upon sign up', async () => {
        const user = userEvent.setup();
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await user.click(screen.getByText('Sign Up'));

        await waitFor(() => {
            const credentials = JSON.parse(localStorage.getItem('frenchApp_credentials'));
            expect(credentials['test@example.com']).toBeDefined();
            expect(credentials['test@example.com'].password).toContain(':'); // Should be hashed
            expect(credentials['test@example.com'].password).not.toBe('password123'); // Should not be plaintext
        });
    });

    it('should verify hashed password upon sign in', async () => {
        const user = userEvent.setup();

        // 1. Initial render
        const { unmount } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // 2. Sign Up
        await user.click(screen.getByText('Sign Up'));
        await waitFor(() => {
            expect(screen.getByTestId('user-id')).not.toBeEmptyDOMElement();
        });

        // 3. Unmount to simulate fresh start (clears Context state)
        unmount();

        // Remove 'frenchApp_user' to simulate logged out state
        localStorage.removeItem('frenchApp_user');

        // 4. Re-render
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // 5. Sign In
        await user.click(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(screen.getByTestId('user-id')).toHaveTextContent('test@example.com');
            expect(screen.getByTestId('error')).toBeEmptyDOMElement();
        });
    });

    it('should upgrade legacy plaintext password on sign in', async () => {
        const user = userEvent.setup();

        // Pre-seed legacy password
        const credentials = {
            'legacy@example.com': {
                password: 'legacyPassword',
                createdAt: Date.now()
            }
        };
        localStorage.setItem('frenchApp_credentials', JSON.stringify(credentials));

        render(
            <AuthProvider>
                <LegacyTestComponent />
            </AuthProvider>
        );

        await user.click(screen.getByText('Sign In Legacy'));

        await waitFor(() => {
            expect(screen.getByTestId('user-id')).toHaveTextContent('legacy@example.com');
        });

        // Verify it was upgraded
        const updatedCredentials = JSON.parse(localStorage.getItem('frenchApp_credentials'));
        expect(updatedCredentials['legacy@example.com'].password).toContain(':');
        expect(updatedCredentials['legacy@example.com'].password).not.toBe('legacyPassword');
        expect(updatedCredentials['legacy@example.com'].password.split(':').length).toBe(3); // Upgraded to 3-part versioned hash
    });

    it('should upgrade legacy 2-part hash password on sign in', async () => {
        const user = userEvent.setup();

        // First, create a valid legacy hash using the crypto.subtle API directly
        // This mimics the 100k iteration format that verifyPassword will accept
        const password = 'password123';
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const salt = crypto.getRandomValues(new Uint8Array(16));

        const key = await crypto.subtle.importKey('raw', data, { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
        const hashBuffer = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', hash: 'SHA-256', iterations: 100000, salt: salt },
            key,
            256
        );

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const saltArray = Array.from(salt);
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('');
        const legacyHash = `${saltHex}:${hashHex}`;

        // Pre-seed legacy 2-part password
        const credentials = {
            'legacyhash@example.com': {
                password: legacyHash,
                createdAt: Date.now()
            }
        };
        localStorage.setItem('frenchApp_credentials', JSON.stringify(credentials));

        render(
            <AuthProvider>
                <LegacyHashTestComponent />
            </AuthProvider>
        );

        await user.click(screen.getByText('Sign In Legacy Hash'));

        // Wait for sign in to complete
        await waitFor(() => {
            expect(screen.getByTestId('user-id')).toHaveTextContent('legacyhash@example.com');
        });

        // Verify it was upgraded
        const updatedCredentials = JSON.parse(localStorage.getItem('frenchApp_credentials'));
        expect(updatedCredentials['legacyhash@example.com'].password).toContain(':');
        expect(updatedCredentials['legacyhash@example.com'].password).not.toBe(legacyHash);
        expect(updatedCredentials['legacyhash@example.com'].password.split(':').length).toBe(3); // Upgraded to 3-part versioned hash
    });
});

const LegacyHashTestComponent = () => {
    const { signIn, user, error } = useAuth();
    return (
        <div>
            <div data-testid="user-id">{user?.id}</div>
            <div data-testid="error">{error}</div>
            <button onClick={() => signIn({ email: 'legacyhash@example.com', password: 'password123' })}>
                Sign In Legacy Hash
            </button>
        </div>
    );
};

const LegacyTestComponent = () => {
    const { signIn, user, error } = useAuth();
    return (
        <div>
            <div data-testid="user-id">{user?.id}</div>
            <div data-testid="error">{error}</div>
            <button onClick={() => signIn({ email: 'legacy@example.com', password: 'legacyPassword' })}>
                Sign In Legacy
            </button>
        </div>
    );
};
