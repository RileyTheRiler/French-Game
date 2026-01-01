import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { calculateLevel, getLevelProgress } from '../utils/gamificationUtils';
import { ACHIEVEMENTS } from '../data/achievements';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
    const defaultStats = {
        xp: 0,
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
        unlockedAchievements: [],
        onboardingComplete: false,
        placementComplete: false,
        placementResult: null,
        onboardingRewarded: false
    };

    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('frenchApp_progress');
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...defaultStats,
                ...parsed,
                inventory: { ...defaultStats.inventory, ...(parsed.inventory || {}) }
            };
        }
        return defaultStats;
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
        const isDoubleXpActive = stats.doubleXpUntil && Date.now() < stats.doubleXpUntil;
        const finalAmount = isDoubleXpActive ? amount * 2 : amount;

        setStats(prev => ({
            ...prev,
            xp: prev.xp + finalAmount
        }));
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
    }, [stats.wordsLearned, stats.streak, stats.storiesCompleted, stats.conversationsCompleted, stats.coins]);

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
        setStats({ ...defaultStats });
        localStorage.setItem('frenchApp_progress', JSON.stringify(defaultStats));
    };

    const level = calculateLevel(stats.xp);
    const progressToNextLevel = getLevelProgress(stats.xp);

    const completeOnboarding = useCallback((reward = { xp: 150, coins: 150 }) => {
        setStats(prev => {
            if (prev.onboardingComplete) return prev;
            return {
                ...prev,
                onboardingComplete: true,
                onboardingRewarded: true,
                xp: prev.xp + (reward?.xp || 0),
                coins: (prev.coins || 0) + (reward?.coins || 0),
                onboardingCompletedAt: Date.now()
            };
        });
    }, []);

    const applyPlacementResult = useCallback(({ xpAward = 0, accuracy = 0, totalQuestions = 0 }) => {
        setStats(prev => {
            const startingXp = Math.max(prev.xp, xpAward);
            return {
                ...prev,
                xp: startingXp,
                placementComplete: true,
                placementResult: {
                    accuracy,
                    totalQuestions,
                    xpAward,
                    timestamp: Date.now(),
                    startingLevel: calculateLevel(startingXp)
                }
            };
        });
    }, []);

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
            incrementStat,
            checkAchievements,
            activateDoubleXP,
            isDoubleXpActive,
            achievements: stats.unlockedAchievements || [],
            completeOnboarding,
            applyPlacementResult
        }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => useContext(ProgressContext);
