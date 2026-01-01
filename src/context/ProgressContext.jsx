import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateLevel, getLevelProgress } from '../utils/gamificationUtils';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('frenchApp_progress');
        return saved ? JSON.parse(saved) : {
            xp: 0,
            streak: 0,
            coins: 50, // Start with some coins
            inventory: {}, // Item ownership { 'streak_freeze': 1 }
            lastLoginDate: null,
            highScore: 0 // Global or aggregate high score could go here
        };
    });

    // Save to local storage whenever stats change
    useEffect(() => {
        localStorage.setItem('frenchApp_progress', JSON.stringify(stats));
    }, [stats]);

    // Check streak on mount
    useEffect(() => {
        checkStreak();
    }, []);

    const checkStreak = () => {
        const today = new Date().toDateString();
        const lastLogin = stats.lastLoginDate;

        if (lastLogin !== today) {
            // It's a new day or first login
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastLogin === yesterday.toDateString()) {
                // Maintained streak
            } else if (lastLogin && new Date(lastLogin) < yesterday) {
                // Streak broken - Check for Freeze
                if (stats.inventory?.['streak_freeze'] > 0) {
                    setStats(prev => ({
                        ...prev,
                        inventory: {
                            ...prev.inventory,
                            'streak_freeze': prev.inventory['streak_freeze'] - 1
                        },
                        frozenUsed: true // Optional flag to show user they were saved
                    }));
                } else {
                    setStats(prev => ({ ...prev, streak: 0 }));
                }
            }
            // Update login date
            setStats(prev => ({ ...prev, lastLoginDate: today }));
        }
    };

    const addXP = (amount) => {
        setStats(prev => ({
            ...prev,
            xp: prev.xp + amount
        }));
    };

    const addCoins = (amount) => {
        setStats(prev => ({
            ...prev,
            coins: (prev.coins || 0) + amount
        }));
    };

    const spendCoins = (amount) => {
        if (stats.coins >= amount) {
            setStats(prev => ({
                ...prev,
                coins: prev.coins - amount
            }));
            return true;
        }
        return false;
    };

    const buyItem = (itemId, cost) => {
        if (stats.coins >= cost) {
            setStats(prev => ({
                ...prev,
                coins: prev.coins - cost,
                inventory: {
                    ...prev.inventory,
                    [itemId]: (prev.inventory?.[itemId] || 0) + 1
                }
            }));
            return true;
        }
        return false;
    };

    const incrementStreak = () => {
        const today = new Date().toDateString();
        // Only increment if we haven't already done a "streak action" today? 
        // For simplicity, let's assume one increment per day logic is handled by the caller or we check a separate "streakIncrementedToday" flag.
        // For this MVP, we will just ensure we don't double count if we already stored a 'lastStreakDate' (which we can add to stats).

        setStats(prev => {
            if (prev.lastStreakDate === today) return prev; // Already incremented today

            return {
                ...prev,
                streak: prev.streak + 1,
                lastStreakDate: today
            };
        });
    };

    const [audioEnabled, setAudioEnabled] = useState(() => {
        const saved = localStorage.getItem('frenchApp_audio');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('frenchApp_audio', JSON.stringify(audioEnabled));
    }, [audioEnabled]);

    const toggleAudio = () => setAudioEnabled(prev => !prev);

    const resetProgress = () => {
        const initialStats = {
            xp: 0,
            streak: 0,
            lastLoginDate: null,
            highScore: 0
        };
        setStats(initialStats);
        localStorage.setItem('frenchApp_progress', JSON.stringify(initialStats));
    };

    const level = calculateLevel(stats.xp);
    const progressToNextLevel = getLevelProgress(stats.xp);

    return (
        <ProgressContext.Provider value={{
            stats,
            level,
            progressToNextLevel,
            addXP,
            incrementStreak,
            audioEnabled,
            toggleAudio,
            resetProgress,
            addCoins,
            spendCoins,
            buyItem
        }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => useContext(ProgressContext);
