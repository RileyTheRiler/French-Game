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
        onboardingRewarded: false,
        targetCefr: 'B1',
        weeklyGoal: {
            sessions: 5,
            minutes: 120
        },
        categoryPerformance: {},
        difficultySettings: {
            fallingWords: 3,
            flashcards: 2,
            grammar: 2
        categoryStats: {}, // { "Family": { attempts: 10, correct: 8, totalResponseTime: 5000 } }
        userGoals: {
            targetCEFR: "A1",
            weeklyXP: 1000,
            weeklyWords: 20
        },
        difficultySettings: {
            globalMultiplier: 1.0,
            penaltyScale: 1.0,
            showHints: true
        }
    };

    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('frenchApp_progress');
        const baseState = {
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
            unlockedAchievements: [],
            updatedAt: Date.now()
        };
        return saved ? { ...baseState, ...JSON.parse(saved) } : baseState;
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...defaultStats,
                ...parsed,
                inventory: { ...defaultStats.inventory, ...(parsed.inventory || {}) },
                weeklyGoal: { ...defaultStats.weeklyGoal, ...(parsed.weeklyGoal || {}) },
                categoryPerformance: parsed.categoryPerformance || defaultStats.categoryPerformance,
                difficultySettings: { ...defaultStats.difficultySettings, ...(parsed.difficultySettings || {}) }
            };
        }
        return defaultStats;
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
                        frozenUsed: true, // Optional flag to show user they were saved
                        updatedAt: Date.now()
                    }));
                } else {
                    setStats(prev => ({ ...prev, streak: 0, updatedAt: Date.now() }));
                }
            }
            // Update login date
            setStats(prev => ({ ...prev, lastLoginDate: today, updatedAt: Date.now() }));
        }
    }, [stats.inventory, stats.lastLoginDate]);
    }, [stats]);

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
            updatedAt: Date.now()
        }));
        updateDailyStat('dailyXP', finalAmount);
    };

    const activateDoubleXP = (durationMinutes = 15) => {
        const expiresAt = Date.now() + (durationMinutes * 60 * 1000);
        setStats(prev => ({
            ...prev,
            doubleXpUntil: expiresAt,
            updatedAt: Date.now()
        }));
    };

    const isDoubleXpActive = () => {
        return stats.doubleXpUntil && Date.now() < stats.doubleXpUntil;
    };

    // Stat incrementers for achievement tracking
    const incrementStat = (statName, amount = 1) => {
        setStats(prev => ({
            ...prev,
            [statName]: (prev[statName] || 0) + amount,
            updatedAt: Date.now()
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
                }, 0),
                updatedAt: Date.now()
            }));
            return newUnlocks;
        }
        return [];
    }, [stats]);

    // Run achievement check when stats change
    useEffect(() => {
        checkAchievements();
    }, [stats]);
    }, [checkAchievements]);

    const addCoins = (amount) => {
        setStats(prev => ({
            ...prev,
            coins: (prev.coins || 0) + amount,
            updatedAt: Date.now()
        }));
        updateDailyStat('dailyCoins', amount);
    };

    const spendCoins = (amount) => {
        if (stats.coins >= amount) {
            setStats(prev => ({
                ...prev,
                coins: prev.coins - amount,
                updatedAt: Date.now()
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
                },
                updatedAt: Date.now()
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
                lastStreakDate: today,
                updatedAt: Date.now()
            };
        });
    };

    const [audioEnabled, setAudioEnabled] = useState(() => {
        const saved = localStorage.getItem('frenchApp_audio');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [offlineAudio, setOfflineAudio] = useState(() => {
        const saved = localStorage.getItem('frenchApp_offlineAudio');
        return saved !== null ? JSON.parse(saved) : false;
    });

    const [reducedMotion, setReducedMotion] = useState(() => {
        const saved = localStorage.getItem('frenchApp_reducedMotion');
        return saved !== null ? JSON.parse(saved) : false;
    });

    const [colorTheme, setColorTheme] = useState(() => {
        return localStorage.getItem('frenchApp_colorTheme') || 'midnight';
    });

    useEffect(() => {
        localStorage.setItem('frenchApp_audio', JSON.stringify(audioEnabled));
    }, [audioEnabled]);

    useEffect(() => {
        localStorage.setItem('frenchApp_offlineAudio', JSON.stringify(offlineAudio));
    }, [offlineAudio]);

    const toggleAudio = () => setAudioEnabled(prev => !prev);
    const toggleOfflineAudio = () => setOfflineAudio(prev => !prev);
        localStorage.setItem('frenchApp_reducedMotion', JSON.stringify(reducedMotion));
        document.body.classList.toggle('reduced-motion', reducedMotion);
    }, [reducedMotion]);

    useEffect(() => {
        localStorage.setItem('frenchApp_colorTheme', colorTheme);
        document.body.dataset.theme = colorTheme;
    }, [colorTheme]);

    const toggleAudio = () => setAudioEnabled(prev => !prev);
    const toggleReducedMotion = () => setReducedMotion(prev => !prev);
    const switchColorTheme = (theme) => setColorTheme(theme);

    const resetProgress = () => {
        const initialStats = {
            xp: 0,
            seasonalXp: 0,
            seasonEndsAt: null,
            seasonId: null,
            streak: 0,
            lastLoginDate: null,
            highScore: 0,
            coins: 50,
            inventory: {},
            unlockedAchievements: [],
            wordsLearned: 0,
            storiesCompleted: 0,
            conversationsCompleted: 0,
            perfectQuizzes: 0,
            updatedAt: Date.now()
        };
        setStats(initialStats);
        localStorage.setItem('frenchApp_progress', JSON.stringify(initialStats));
        setStats({ ...defaultStats });
        localStorage.setItem('frenchApp_progress', JSON.stringify(defaultStats));
    };

    const setTargetCefr = (level = 'B1') => {
        setStats(prev => ({ ...prev, targetCefr: level }));
    };

    const setWeeklyGoal = (goal = {}) => {
        setStats(prev => ({
            ...prev,
            weeklyGoal: {
                ...prev.weeklyGoal,
                ...goal
            }
        }));
    };

    const setModeDifficulty = (mode, value) => {
        setStats(prev => ({
            ...prev,
            difficultySettings: {
                ...prev.difficultySettings,
                [mode]: value
            }
        }));
    };

    const recordCategoryPerformance = (category, { success = false, responseTime = 0, mode = 'general' } = {}) => {
        if (!category) return;
        setStats(prev => {
            const existing = prev.categoryPerformance?.[category] || {
                attempts: 0,
                correct: 0,
                totalResponseTime: 0,
                lastResponseTime: 0,
                lastMode: mode
            };

            const attempts = existing.attempts + 1;
            const correct = existing.correct + (success ? 1 : 0);
            const totalResponseTime = existing.totalResponseTime + (responseTime || 0);

            return {
                ...prev,
                categoryPerformance: {
                    ...(prev.categoryPerformance || {}),
                    [category]: {
                        ...existing,
                        attempts,
                        correct,
                        totalResponseTime,
                        averageResponseTime: totalResponseTime / attempts,
                        lastResponseTime: responseTime || existing.lastResponseTime,
                        lastMode: mode,
                        accuracy: attempts > 0 ? correct / attempts : 0
                    }
                }
            };
        });
    };
    const hydrateProgress = (incomingStats) => {
        if (!incomingStats) return;
        setStats(prev => ({
            ...prev,
            ...incomingStats,
            updatedAt: incomingStats.updatedAt || Date.now()
        }));
    };

    const logWordAttempt = useCallback((category, isCorrect, responseTimeMs) => {
        setStats(prev => {
            const currentCatStats = prev.categoryStats?.[category] || { attempts: 0, correct: 0, totalResponseTime: 0 };
            return {
                ...prev,
                categoryStats: {
                    ...prev.categoryStats,
                    [category]: {
                        attempts: currentCatStats.attempts + 1,
                        correct: currentCatStats.correct + (isCorrect ? 1 : 0),
                        totalResponseTime: currentCatStats.totalResponseTime + responseTimeMs
                    },
                },
                updatedAt: Date.now()
            };
        });
    }, []);

    const updateUserGoals = useCallback((newGoals) => {
        setStats(prev => ({
            ...prev,
            userGoals: { ...prev.userGoals, ...newGoals },
            updatedAt: Date.now()
        }));
    }, []);

    const updateDifficultySettings = useCallback((newSettings) => {
        setStats(prev => ({
            ...prev,
            difficultySettings: { ...prev.difficultySettings, ...newSettings },
            updatedAt: Date.now()
        }));
    }, []);

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
            offlineAudio,
            toggleOfflineAudio,
            reducedMotion,
            toggleReducedMotion,
            colorTheme,
            switchColorTheme,
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
            achievements: stats.unlockedAchievements || [],
            hydrateProgress,
            completeOnboarding,
            applyPlacementResult,
            setTargetCefr,
            setWeeklyGoal,
            setModeDifficulty,
            recordCategoryPerformance
            logWordAttempt,
            updateUserGoals,
            userGoals: stats.userGoals,
            updateDifficultySettings,
            difficultySettings: stats.difficultySettings,
            categoryStats: stats.categoryStats
        }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => useContext(ProgressContext);
