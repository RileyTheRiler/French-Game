import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

// Mock Component to test the hook
const TestComponent = () => {
    const { user, signIn, signUp, signOut, error } = useAuth();

    return (
        <div>
            {user ? (
                <div>
                    <p data-testid="user-email">{user.email}</p>
                    <button onClick={signOut}>Sign Out</button>
                </div>
            ) : (
                <div>
                    <button onClick={() => signUp({ email: 'test@example.com', password: 'password123' })}>Sign Up</button>
                    <button onClick={() => signIn({ email: 'test@example.com', password: 'password123' })}>Sign In</button>
                    <button onClick={() => signIn({ email: 'test@example.com', password: 'wrongpassword' })}>Sign In Wrong</button>
                    {error && <p data-testid="error">{error}</p>}
                </div>
            )}
        </div>
    );
};

// Mock Component for Legacy user test
const LegacyTestComponent = () => {
    const { signIn, error, user } = useAuth();
    return (
        <div>
            {user ? <p data-testid="user-email">{user.email}</p> : null}
            <button onClick={() => signIn({ email: 'legacy@example.com', password: 'oldpassword' })}>Sign In Legacy</button>
            {error && <p data-testid="error">{error}</p>}
        </div>
    )
}

describe('AuthContext', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.restoreAllMocks();
    });

    it('should sign up a user securely (hashing password)', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const user = userEvent.setup();
        await user.click(screen.getByText('Sign Up'));

        // Check if user is logged in
        expect(await screen.findByTestId('user-email')).toHaveTextContent('test@example.com');

        // Check localStorage for hashed password
        const credentials = JSON.parse(window.localStorage.getItem('frenchApp_credentials'));
        expect(credentials['test@example.com']).toBeDefined();
        expect(credentials['test@example.com'].password).toBeUndefined(); // Should NOT store plaintext
        expect(credentials['test@example.com'].hash).toBeDefined();
        expect(credentials['test@example.com'].salt).toBeDefined();
    });

    it('should sign in a user with correct password', async () => {
        // First sign up
        const salt = 'testsalt';
        // We need to mock crypto functions if they were not real, but jsdom supports them.
        // However, let's just rely on the real implementation which we just tested in signUp.

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const user = userEvent.setup();
        // Sign up first
        await user.click(screen.getByText('Sign Up'));
        await screen.findByTestId('user-email');

        // Sign out
        await user.click(screen.getByText('Sign Out'));

        // Sign in
        await user.click(screen.getByText('Sign In'));
        expect(await screen.findByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    it('should fail sign in with wrong password', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const user = userEvent.setup();
        // Sign up first
        await user.click(screen.getByText('Sign Up'));
        await screen.findByTestId('user-email');

        // Sign out
        await user.click(screen.getByText('Sign Out'));

        // Sign in with wrong password
        await user.click(screen.getByText('Sign In Wrong'));
        expect(await screen.findByTestId('error')).toHaveTextContent('Invalid credentials');
    });

    it('should support legacy plaintext passwords and migrate them', async () => {
        // Manually seed localStorage with legacy user
        const legacyCredentials = {
            'legacy@example.com': { password: 'oldpassword', createdAt: Date.now() }
        };
        window.localStorage.setItem('frenchApp_credentials', JSON.stringify(legacyCredentials));

        render(
            <AuthProvider>
                <LegacyTestComponent />
            </AuthProvider>
        );

        const user = userEvent.setup();
        await user.click(screen.getByText('Sign In Legacy'));

        expect(await screen.findByTestId('user-email')).toHaveTextContent('legacy@example.com');

        // Verify migration occurred
        const credentials = JSON.parse(window.localStorage.getItem('frenchApp_credentials'));
        expect(credentials['legacy@example.com'].password).toBeUndefined();
        expect(credentials['legacy@example.com'].hash).toBeDefined();
        expect(credentials['legacy@example.com'].salt).toBeDefined();
    });
});
