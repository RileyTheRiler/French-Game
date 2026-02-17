/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { hashPassword, verifyPassword } from '../utils/crypto';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user from local storage on mount
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('frenchApp_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (err) {
            console.error("Failed to load user", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (username, password) => {
        setLoading(true);
        setError(null);

        // Emulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const storedUsers = JSON.parse(localStorage.getItem('frenchApp_users') || '[]');
            const record = storedUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

            if (!record) {
                // Timing attack prevention: simulate verify work even if user not found
                // We pass dummy data to verifyPassword to consume similar time
                // This is a simplified simulation
                await verifyPassword("dummy_hash:salt", "dummy_password");
                throw new Error("Invalid credentials");
            }

            const isValid = await verifyPassword(record.password, password);
            if (!isValid) {
                throw new Error("Invalid credentials");
            }

            // Success
            const userData = { username: record.username, id: record.id };
            setUser(userData);
            localStorage.setItem('frenchApp_user', JSON.stringify(userData));
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const signup = useCallback(async (username, password) => {
        setLoading(true);
        setError(null);

        // Emulate delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const storedUsers = JSON.parse(localStorage.getItem('frenchApp_users') || '[]');
            if (storedUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                throw new Error("Username already taken");
            }

            const hashedPassword = await hashPassword(password);
            const newUser = {
                id: `user_${Date.now()}`,
                username,
                password: hashedPassword,
                createdAt: Date.now()
            };

            storedUsers.push(newUser);
            localStorage.setItem('frenchApp_users', JSON.stringify(storedUsers));

            // Auto login
            const userData = { username: newUser.username, id: newUser.id };
            setUser(userData);
            localStorage.setItem('frenchApp_user', JSON.stringify(userData));
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('frenchApp_user');
    }, []);

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
