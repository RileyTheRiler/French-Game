import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { nanoid } from '../utils/id';

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
            credentials[email] = { password, createdAt: Date.now() };
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
            if (!record || record.password !== password) {
                throw new Error('Invalid credentials');
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
