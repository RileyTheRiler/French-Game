import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { nanoid } from '../utils/id';
import { hashPassword, verifyPassword } from '../utils/crypto';

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

            if (!record) {
                throw new Error('Invalid credentials');
            }

            // Handle legacy format (separate hash/salt) if encountered
            if (!record.password && record.hash && record.salt) {
                record.password = `${record.salt}:${record.hash}`;
            }

            const isValid = await verifyPassword(record.password, password);
            if (!isValid) {
                throw new Error('Invalid credentials');
            }

            // Auto-migrate legacy passwords (plaintext or 2-part hash) to 3-part versioned hash
            // verifyPassword handles checking all formats, but we should upgrade storage
            // 3-part format looks like: '600000:<saltHex>:<hashHex>'
            let needsUpgrade = false;
            const parts = record.password.split(':');

            if (parts.length < 3) {
                needsUpgrade = true;
            } else {
                const iterations = parseInt(parts[0], 10);
                // Also upgrade if the current iterations are less than the recommended amount
                if (iterations < 600000) {
                    needsUpgrade = true;
                }
            }

            if (needsUpgrade) {
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
