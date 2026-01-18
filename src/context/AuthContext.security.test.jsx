
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
    });
});

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
