import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { calculateLevel, getLevelProgress } from '../utils/gamificationUtils';
import { ACHIEVEMENTS } from '../data/achievements';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('frenchApp_progress');
        return saved ? JSON.parse(saved) : {
            xp: 0,
            seasonalXp: 0,
            seasonEndsAt: null,
            seasonId: null,
            streak: 0,
            coins: 50,
            inventory: {},
            doubleXpUntil: null,
            lastLoginDate: null,
            highScore: 0,
            wordsLearned: 0,
            storiesCompleted: 0,
            conversationsCompleted: 0,
            perfectQuizzes: 0,
            timedChallengesCompleted: 0,
            unlockedAchievements: []
        };
    });

    // Save to local storage whenever stats change
    useEffect(() => {
        localStorage.setItem('frenchApp_progress', JSON.stringify(stats));
    }, [stats]);

    const checkStreak = useCallback(() => {
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
    }, [stats.inventory, stats.lastLoginDate]);

    // Check streak on mount
    useEffect(() => {
        checkStreak();
    }, [checkStreak]);

    const ensureSeasonWindow = useCallback(() => {
        setStats(prev => {
            const now = Date.now();
            if (prev.seasonEndsAt && prev.seasonEndsAt > now) return prev;

            const nextSeasonDate = new Date();
            nextSeasonDate.setMonth(nextSeasonDate.getMonth() + 1, 1);
            nextSeasonDate.setHours(0, 0, 0, 0);

            return {
                ...prev,
                seasonEndsAt: nextSeasonDate.getTime(),
                seasonId: `${nextSeasonDate.getFullYear()}-${nextSeasonDate.getMonth() + 1}`,
                seasonalXp: 0
            };
        });
    }, []);

    useEffect(() => {
        ensureSeasonWindow();
    }, [ensureSeasonWindow]);

    const updateDailyStat = useCallback((statName, amount = 1, mode = 'add') => {
        const today = new Date().toDateString();
        const stored = localStorage.getItem('frenchApp_dailyStats');
        const parsed = stored ? JSON.parse(stored) : {};
        const base = parsed.date === today ? parsed : { date: today };
        const currentValue = base[statName] || 0;
        const nextValue = mode === 'max' ? Math.max(currentValue, amount) : currentValue + amount;
        const updated = { ...base, [statName]: nextValue };
        localStorage.setItem('frenchApp_dailyStats', JSON.stringify(updated));
    }, []);

    const addXP = (amount) => {
        ensureSeasonWindow();
        const isDoubleXpActive = stats.doubleXpUntil && Date.now() < stats.doubleXpUntil;
        const finalAmount = isDoubleXpActive ? amount * 2 : amount;

        setStats(prev => ({
            ...prev,
            xp: prev.xp + finalAmount,
            seasonalXp: (prev.seasonalXp || 0) + finalAmount
        }));
        updateDailyStat('dailyXP', finalAmount);
    };

    const activateDoubleXP = (durationMinutes = 15) => {
        const expiresAt = Date.now() + (durationMinutes * 60 * 1000);
        setStats(prev => ({
            ...prev,
            doubleXpUntil: expiresAt
        }));
    };

    const isDoubleXpActive = () => {
        return stats.doubleXpUntil && Date.now() < stats.doubleXpUntil;
    };

    // Stat incrementers for achievement tracking
    const incrementStat = (statName, amount = 1) => {
        setStats(prev => ({
            ...prev,
            [statName]: (prev[statName] || 0) + amount
        }));
    };

    // Check and unlock achievements
    const checkAchievements = useCallback(() => {
        const currentLevel = calculateLevel(stats.xp);
        const newUnlocks = [];

        ACHIEVEMENTS.forEach(achievement => {
            if (!stats.unlockedAchievements?.includes(achievement.id)) {
                if (achievement.condition(stats, currentLevel)) {
                    newUnlocks.push(achievement.id);
                }
            }
        });

        if (newUnlocks.length > 0) {
            setStats(prev => ({
                ...prev,
                unlockedAchievements: [...(prev.unlockedAchievements || []), ...newUnlocks],
                xp: prev.xp + newUnlocks.reduce((sum, id) => {
                    const ach = ACHIEVEMENTS.find(a => a.id === id);
                    return sum + (ach?.xpReward || 0);
                }, 0)
            }));
            return newUnlocks;
        }
        return [];
    }, [stats]);

    // Run achievement check when stats change
    useEffect(() => {
        checkAchievements();
    }, [stats]);

    const addCoins = (amount) => {
        setStats(prev => ({
            ...prev,
            coins: (prev.coins || 0) + amount
        }));
        updateDailyStat('dailyCoins', amount);
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

    const consumeItem = (itemId, amount = 1) => {
        const owned = stats.inventory?.[itemId] || 0;
        if (owned < amount) return false;

        setStats(prev => ({
            ...prev,
            inventory: {
                ...prev.inventory,
                [itemId]: Math.max(0, (prev.inventory?.[itemId] || 0) - amount)
            }
        }));
        return true;
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
            seasonalXp: 0,
            seasonEndsAt: null,
            seasonId: null,
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
            buyItem,
            consumeItem,
            incrementStat,
            checkAchievements,
            activateDoubleXP,
            isDoubleXpActive,
            updateDailyStat,
            achievements: stats.unlockedAchievements || []
        }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => useContext(ProgressContext);
