import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { nanoid } from '../utils/id';
import { hashPassword, verifyPassword } from '../utils/crypto';

const AuthContext = createContext();

const STORAGE_KEY = 'frenchApp_user';
const CREDENTIALS_KEY = 'frenchApp_credentials';

// Dummy hash for non-existent users to prevent timing attacks
// Salt: 16 bytes (32 hex chars) of zeros
// Hash: 32 bytes (64 hex chars) of zeros
const DUMMY_HASH = "00000000000000000000000000000000:0000000000000000000000000000000000000000000000000000000000000000";

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

            // Security: Hash password before storage
            const hashedPassword = await hashPassword(password);
            credentials[email] = { password: hashedPassword, createdAt: Date.now() };

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
            let record = credentials[email];

            // Handle legacy format (separate hash/salt) if encountered
            if (record && !record.password && record.hash && record.salt) {
                record.password = `${record.salt}:${record.hash}`;
            }

            // Mitigate user enumeration via timing attacks:
            // Always verify a hash (real or dummy) so the operation takes consistent time.
            const hashToVerify = record ? record.password : DUMMY_HASH;
            const isValid = await verifyPassword(hashToVerify, password);

            if (!record || !isValid) {
                throw new Error('Invalid credentials');
            }

            // Auto-migrate legacy plaintext passwords
            // verifyPassword handles checking plaintext, but we should upgrade storage
            if (record.password === password) {
                const newHash = await hashPassword(password);
                credentials[email] = { ...record, password: newHash };
                localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
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
