import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { nanoid } from '../utils/id';
import { hashPassword, generateSalt } from '../utils/crypto';

const AuthContext = createContext();

const STORAGE_KEY = 'frenchApp_user';
const CREDENTIALS_KEY = 'frenchApp_credentials';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [user]);

    const providers = useMemo(() => ([
        { id: 'email', label: 'Email & Password' },
        { id: 'oauth-demo', label: 'OAuth (demo)' }
    ]), []);

    const signUp = useCallback(async ({ email, password }) => {
        setLoading(true);
        setError(null);
        try {
            const credentials = JSON.parse(localStorage.getItem(CREDENTIALS_KEY) || '{}');
            if (credentials[email]) {
                throw new Error('Account already exists');
            }

            const salt = generateSalt();
            const hash = await hashPassword(password, salt);

            credentials[email] = {
                hash,
                salt,
                createdAt: Date.now()
            };

            localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
            const newUser = { id: nanoid(), email, createdAt: Date.now(), provider: 'email' };
            setUser(newUser);
            return newUser;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const signIn = useCallback(async ({ email, password, provider = 'email' }) => {
        setLoading(true);
        setError(null);
        try {
            if (provider !== 'email') {
                const oauthUser = { id: `oauth-${email || nanoid()}`, email: email || 'demo@oauth.local', provider, createdAt: Date.now() };
                setUser(oauthUser);
                return oauthUser;
            }
            const credentials = JSON.parse(localStorage.getItem(CREDENTIALS_KEY) || '{}');
            const record = credentials[email];

            if (!record) {
                throw new Error('Invalid credentials');
            }

            // Backward compatibility for old plain text passwords (optional, but good practice)
            if (record.password) {
                if (record.password !== password) throw new Error('Invalid credentials');
                // Auto-migrate to hash?
                // For now, just allow logic to proceed or maybe we should migrate it.
                // Let's just focus on new logic. If it has password field, it's legacy.
                // But for this "small fix", we might just assume we wipe or break old accounts,
                // OR we support both. supporting both is safer.

                // Let's assume we enforce hashing. If record has 'password', we compare plaintext.
                // If 'hash', we compare hash.
            } else if (record.hash && record.salt) {
                const attemptHash = await hashPassword(password, record.salt);
                if (attemptHash !== record.hash) {
                    throw new Error('Invalid credentials');
                }
            } else {
                throw new Error('Invalid credentials'); // corrupted record
            }

            const signedInUser = { id: email, email, provider: 'email', createdAt: record.createdAt };
            setUser(signedInUser);
            return signedInUser;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const signOut = useCallback(() => {
        setUser(null);
    }, []);

    const value = {
        user,
        loading,
        error,
        providers,
        signIn,
        signUp,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
