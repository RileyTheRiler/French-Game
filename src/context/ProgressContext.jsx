import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { calculateLevel, getLevelProgress } from '../utils/gamificationUtils';
import { ACHIEVEMENTS } from '../data/achievements';
import { checkStreakMilestone } from '../data/leagues';
import { useToast } from './ToastContext';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
    const { showAchievement, showSuccess } = useToast();
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
        categoryStats: {}, // { "Family": { attempts: 10, correct: 8, totalResponseTime: 5000 } }
        userGoals: {
            targetCEFR: "A1",
            weeklyXP: 1000,
            weeklyWords: 20
        },
        dailyStats: {}, // { "2024-03-20": { xp: 50, words: 10, accuracy: 0.8, time: 3000 } }
        errorPatterns: {}, // { "word_id": { count: 3, lastMiss: timestamp } }
        difficultySettings: {
            globalMultiplier: 1.0,
            penaltyScale: 1.0,
            showHints: true,
            practiceModeNoPenalty: false,
            challengeMode: false,      // Disable all hints when true
            hintDelay: 8,              // Seconds before hints appear (0-10)
            freeFormInput: false,      // Use text input instead of multiple choice
            learnerType: 'casual'      // 'casual' | 'scholar'
        },
        dailyMixStreak: 0,
        lastDailyMixDate: null,
        weakWords: {}, // { "wordId": { strength: 0-100, lastPracticed: timestamp } }
        dailyXPGoal: 50, // Default beginner-friendly goal
        // dailyStats also tracks coinsEarned and dailyXP now
    };

    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('frenchApp_progress');
        const baseState = {
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
            updatedAt: Date.now()
        };
        return saved ? { ...baseState, ...JSON.parse(saved) } : baseState;
    });

    // Ensure new fields exist if loading from old state
    useEffect(() => {
        setStats(prev => ({
            ...prev,
            dailyStats: prev.dailyStats || {},
            errorPatterns: prev.errorPatterns || {},
            lastWeeklyRecap: prev.lastWeeklyRecap || null
        }));
    }, []);

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
    };

    const addXP = (amount) => {
        const isDoubleXpActive = stats.doubleXpUntil && Date.now() < stats.doubleXpUntil;
        const finalAmount = isDoubleXpActive ? amount * 2 : amount;
        const today = new Date().toDateString();

        setStats(prev => {
            const currentDaily = prev.dailyStats?.[today] || {};
            const newDailyXP = (currentDaily.dailyXP || 0) + finalAmount;

            return {
                ...prev,
                xp: prev.xp + finalAmount,
                dailyStats: {
                    ...prev.dailyStats,
                    [today]: {
                        ...currentDaily,
                        dailyXP: newDailyXP,
                        xp: (currentDaily.xp || 0) + finalAmount
                    }
                },
                updatedAt: Date.now()
            };
        });
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
                    if (ach) showAchievement(ach); // Trigger Toast
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
    }, [stats.wordsLearned, stats.streak, stats.storiesCompleted, stats.conversationsCompleted, stats.coins]);

    const addCoins = (amount) => {
        setStats(prev => {
            const today = new Date().toDateString();
            const currentDaily = prev.dailyStats?.[today] || {};
            const coinsAlreadyEarned = currentDaily.coinsEarned || 0;

            // Soft Cap Logic
            // 0-100: 100%
            // 100-250: 50%
            // 250+: 10%

            let effectiveAmount = 0;
            let remainingAmount = amount;
            let currentTierBase = coinsAlreadyEarned;

            // Simple stepwise calculation
            // Note: This is a bit simplified, calculating per-event rather than strictly cutting off mid-amount,
            // but for small increments (typical 5-10 coins) it's fine to just check the starting tier.

            let multiplier = 1.0;
            if (currentTierBase >= 250) {
                multiplier = 0.1;
            } else if (currentTierBase >= 100) {
                multiplier = 0.5;
            }

            // Apply multiplier
            effectiveAmount = Math.ceil(amount * multiplier);

            // Update stats
            return {
                ...prev,
                coins: (prev.coins || 0) + effectiveAmount,
                dailyStats: {
                    ...prev.dailyStats,
                    [today]: {
                        ...currentDaily,
                        coinsEarned: coinsAlreadyEarned + effectiveAmount
                    }
                },
                updatedAt: Date.now()
            };
        });

        // Return true/false or actual amount earned if needed later, but void for now
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

    const buyItem = (item) => {
        // item object should have id, basePrice (or price), type
        const cost = item.price || item.basePrice;
        if (stats.coins >= cost) {
            setStats(prev => {
                const currentInventory = prev.inventory || {};
                let newInventoryData = 0;

                // If it's a cosmetic, we just store "true" (owned) or 1.
                // If it's a consumable, we stack it.
                if (item.type === 'cosmetic') {
                    newInventoryData = 1; // Owned
                } else {
                    newInventoryData = (currentInventory[item.id] || 0) + 1;
                }

                return {
                    ...prev,
                    coins: prev.coins - cost,
                    inventory: {
                        ...currentInventory,
                        [item.id]: newInventoryData
                    },
                    updatedAt: Date.now()
                };
            });
            return true;
        }
        return false;
    };

    const incrementStreak = () => {
        const today = new Date().toDateString();

        setStats(prev => {
            if (prev.lastStreakDate === today) return prev; // Already incremented today

            const newStreak = prev.streak + 1;

            // Check for milestone rewards
            const milestone = checkStreakMilestone(newStreak);
            let bonusXP = 0;
            let bonusCoins = 0;

            if (milestone) {
                bonusXP = milestone.xpBonus;
                bonusCoins = milestone.coinBonus;
                showSuccess(`🎉 ${milestone.title}! +${bonusXP} XP, +${bonusCoins} coins!`);
            } else if (newStreak % 5 === 0) {
                showSuccess(`🔥 ${newStreak} Day Streak! Keep it up!`);
            }

            return {
                ...prev,
                streak: newStreak,
                lastStreakDate: today,
                xp: prev.xp + bonusXP,
                coins: (prev.coins || 0) + bonusCoins,
                updatedAt: Date.now()
            };
        });
    };

    const incrementDailyMixStreak = useCallback(() => {
        const today = new Date().toDateString();
        setStats(prev => {
            if (prev.lastDailyMixDate === today) return prev;
            return {
                ...prev,
                dailyMixStreak: (prev.dailyMixStreak || 0) + 1,
                lastDailyMixDate: today,
                updatedAt: Date.now()
            };
        });
    }, []);

    const [audioEnabled, setAudioEnabled] = useState(() => {
        const saved = localStorage.getItem('frenchApp_audio');
        return saved !== null ? JSON.parse(saved) : true;
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

    const hydrateProgress = (incomingStats) => {
        if (!incomingStats) return;
        setStats(prev => ({
            ...prev,
            ...incomingStats,
            updatedAt: incomingStats.updatedAt || Date.now()
        }));
    };

    const logWordAttempt = useCallback((category, isCorrect, responseTimeMs, wordId) => {
        setStats(prev => {
            const today = new Date().toDateString();
            const currentCatStats = prev.categoryStats?.[category] || { attempts: 0, correct: 0, totalResponseTime: 0 };
            const currentDaily = prev.dailyStats?.[today] || { xp: 0, words: 0, accuracy: 0, time: 0, attempts: 0, correct: 0 };

            // Update Error Patterns if wrong
            let newErrorPatterns = { ...prev.errorPatterns };
            if (!isCorrect && wordId) {
                const currentError = newErrorPatterns[wordId] || { count: 0, lastMiss: 0 };
                newErrorPatterns[wordId] = {
                    count: currentError.count + 1,
                    lastMiss: Date.now()
                };
            }

            // Daily Stats Math
            const newDailyAttempts = (currentDaily.attempts || 0) + 1;
            const newDailyCorrect = (currentDaily.correct || 0) + (isCorrect ? 1 : 0);
            const newDailyAccuracy = newDailyAttempts > 0 ? newDailyCorrect / newDailyAttempts : 0;

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
                dailyStats: {
                    ...prev.dailyStats,
                    [today]: {
                        ...currentDaily,
                        attempts: newDailyAttempts,
                        correct: newDailyCorrect,
                        accuracy: newDailyAccuracy,
                        time: (currentDaily.time || 0) + responseTimeMs,
                        words: (currentDaily.words || 0) + (isCorrect ? 1 : 0)
                    }
                },
                errorPatterns: newErrorPatterns,
                updatedAt: Date.now()
            };
        });
    }, []);

    const getWeeklySummary = useCallback(() => {
        const today = new Date();
        const summary = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateParams = d.toDateString();
            summary.push({
                date: dateParams,
                ...stats.dailyStats?.[dateParams] || { xp: 0, words: 0, accuracy: 0, time: 0 }
            });
        }
        return summary;
    }, [stats.dailyStats]);

    const markWeeklyRecapSeen = () => {
        setStats(prev => ({ ...prev, lastWeeklyRecap: new Date().toDateString() }));
    };

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

    const markWordStrength = useCallback((wordId, score) => {
        setStats(prev => {
            const currentStrength = prev.weakWords?.[wordId]?.strength || 0;
            // Weighted average: 70% old strength, 30% new score
            const newStrength = Math.round((currentStrength * 0.7) + (score * 0.3));

            return {
                ...prev,
                weakWords: {
                    ...prev.weakWords,
                    [wordId]: {
                        strength: newStrength,
                        lastPracticed: Date.now()
                    }
                },
                updatedAt: Date.now()
            };
        });
    }, []);

    const updateDailyXPGoal = useCallback((goal) => {
        setStats(prev => ({
            ...prev,
            dailyXPGoal: goal,
            updatedAt: Date.now()
        }));
    }, []);

    return (
        <ProgressContext.Provider value={{
            stats,
            level,
            progressToNextLevel,
            addXP,
            incrementStreak,
            incrementDailyMixStreak,
            audioEnabled,
            toggleAudio,
            reducedMotion,
            toggleReducedMotion,
            colorTheme,
            switchColorTheme,
            resetProgress,
            addCoins,
            spendCoins,
            buyItem,
            incrementStat,
            checkAchievements,
            activateDoubleXP,
            isDoubleXpActive,
            achievements: stats.unlockedAchievements || [],
            hydrateProgress,
            completeOnboarding,
            applyPlacementResult,
            logWordAttempt,
            updateUserGoals,
            userGoals: stats.userGoals,
            updateDifficultySettings,
            difficultySettings: stats.difficultySettings,
            categoryStats: stats.categoryStats,
            dailyStats: stats.dailyStats,
            errorPatterns: stats.errorPatterns,
            getWeeklySummary,
            lastWeeklyRecap: stats.lastWeeklyRecap,
            markWeeklyRecapSeen,
            weakWords: stats.weakWords,
            markWordStrength,
            dailyXPGoal: stats.dailyXPGoal || 50,
            updateDailyXPGoal
        }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => useContext(ProgressContext);
