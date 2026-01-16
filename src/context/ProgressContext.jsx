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
        seasonalXp: 0,
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
            minutes: 120,
            sessionsPerWeek: 3,
            currentWeekStart: null,
            sessionsThisWeek: [],
            lastWeekCompleted: false
        },
        categoryPerformance: {},
        difficultySettings: {
            fallingWords: 3,
            flashcards: 2,
            grammar: 2,
            globalMultiplier: 1.0,
            showHints: true,
            practiceModeNoPenalty: false,
            challengeMode: false,
            hintDelay: 8,
            freeFormInput: false,
            learnerType: 'casual'
        },
        categoryStats: {},
        userGoals: {
            targetCEFR: "A1",
            weeklyXP: 1000,
            weeklyWords: 20
        },
        dailyStats: {},
        errorPatterns: {},
        reviewQueue: [],
        dailyMixStreak: 0,
        lastDailyMixDate: null,
        weakWords: {},
        conceptMastery: {},
        dailyXPGoal: 50,
        conversationHistory: [],
        conversationStats: {
            totalSessions: 0,
            avgAccuracy: 0,
            avgFluency: 0
        },
        learningProfile: {
            preferAudio: null,
            preferStructured: null,
            preferPressure: null,
            preferGrammar: null,
            preferDaily: null,
            completed: false,
            completedAt: null
        },
        globalDifficulty: 25,
        focusModeStats: {
            grammarHour: { completed: 0, totalTime: 0 },
            listeningLab: { completed: 0, totalTime: 0 },
            vocabSprint: { completed: 0, totalTime: 0 }
        },
        branchingStoriesProgress: {},
        readingRoomProgress: {},
        shadowingProgress: {},
        cultureArticlesRead: [],
        userLessonsCreated: 0,
        speedRoundEnabled: true,
        preferredPlaybackSpeed: 1.0,
        podcastSessionsCompleted: 0,
        writingPadSessions: 0,
        patternDrillsCompleted: 0,
        regionProgress: {},
        mediaProgress: {},
        cognitiveStats: {
            flowMultiplier: 1.0,
            lastResponseTimes: [],
            recentMisses: 0,
            fatigueLevel: 0,
            sessionStartTime: null,
            smartBreakSuggested: false
        },
        dreamGoals: {
            thinkingInFrench: null,
            dreamingInFrench: null,
            firstJokeUnderstood: null,
            firstSongUnderstood: null
        },
        memoryPalace: {
            rooms: {},
            unlockedRooms: ['kitchen']
        },
        survivalBest: {}
    };

    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('frenchApp_progress');
        const baseState = {
            ...defaultStats,
            seasonEndsAt: null,
            seasonId: null,
            updatedAt: Date.now()
        };

        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...baseState,
                ...parsed,
                inventory: { ...baseState.inventory, ...(parsed.inventory || {}) },
                weeklyGoal: { ...baseState.weeklyGoal, ...(parsed.weeklyGoal || {}) },
                categoryPerformance: parsed.categoryPerformance || baseState.categoryPerformance,
                difficultySettings: { ...baseState.difficultySettings, ...(parsed.difficultySettings || {}) },
                dailyStats: parsed.dailyStats || {},
                errorPatterns: parsed.errorPatterns || {},
                lastWeeklyRecap: parsed.lastWeeklyRecap || null
            };
        }
        return baseState;
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

    // Check streak on mount - use timeout to avoid synchronous setState warning
    useEffect(() => {
        const timer = setTimeout(() => {
            checkStreak();
        }, 0);
        return () => clearTimeout(timer);
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
        const timer = setTimeout(() => {
            ensureSeasonWindow();
        }, 0);
        return () => clearTimeout(timer);
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
        const today = new Date().toDateString();

        setStats(prev => {
            const currentDaily = prev.dailyStats?.[today] || {};
            const newDailyXP = (currentDaily.dailyXP || 0) + finalAmount;

            return {
                ...prev,
                xp: prev.xp + finalAmount,
                seasonalXp: (prev.seasonalXp || 0) + finalAmount,
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

        // Also update the separate dailyStats localStorage for redundancy if needed
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
                    if (ach) showAchievement(ach); // Trigger Toast
                    return sum + (ach?.xpReward || 0);
                }, 0),
                updatedAt: Date.now()
            }));
            return newUnlocks;
        }
        return [];
    }, [stats, showAchievement]);

    // Run achievement check when stats change
    useEffect(() => {
        const timer = setTimeout(() => {
            checkAchievements();
        }, 0);
        return () => clearTimeout(timer);
    }, [checkAchievements]);

    const addCoins = (amount) => {
        const today = new Date().toDateString();

        setStats(prev => {
            const currentDaily = prev.dailyStats?.[today] || {};
            const coinsAlreadyEarned = currentDaily.coinsEarned || 0;

            // Soft Cap Logic
            // 0-100: 100%
            // 100-250: 50%
            // 250+: 10%

            let effectiveAmount = 0;
            let currentTierBase = coinsAlreadyEarned;

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

    useEffect(() => {
        localStorage.setItem('frenchApp_reducedMotion', JSON.stringify(reducedMotion));
        document.body.classList.toggle('reduced-motion', reducedMotion);
    }, [reducedMotion]);

    useEffect(() => {
        localStorage.setItem('frenchApp_colorTheme', colorTheme);
        document.body.dataset.theme = colorTheme;
    }, [colorTheme]);

    const toggleAudio = () => setAudioEnabled(prev => !prev);
    const toggleOfflineAudio = () => setOfflineAudio(prev => !prev);
    const toggleReducedMotion = () => setReducedMotion(prev => !prev);
    const switchColorTheme = (theme) => setColorTheme(theme);

    const resetProgress = () => {
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

    const addToReviewQueue = useCallback((wordId) => {
        setStats(prev => {
            if (prev.reviewQueue?.includes(wordId)) return prev;
            return {
                ...prev,
                reviewQueue: [...(prev.reviewQueue || []), wordId],
                updatedAt: Date.now()
            };
        });
    }, []);

    const removeFromReviewQueue = useCallback((wordId) => {
        setStats(prev => ({
            ...prev,
            reviewQueue: (prev.reviewQueue || []).filter(id => id !== wordId),
            updatedAt: Date.now()
        }));
    }, []);

    const updateUserGoals = useCallback((newGoals) => {
        setStats(prev => ({
            ...prev,
            userGoals: { ...prev.userGoals, ...newGoals },
            updatedAt: Date.now()
        }));
    }, []);

    const updateDailyXPGoalFn = useCallback((goal) => {
        setStats(prev => ({
            ...prev,
            dailyXPGoal: goal,
            updatedAt: Date.now()
        }));
    }, []);

    const trackConversationSession = useCallback((sessionData) => {
        setStats(prev => {
            const history = prev.conversationHistory || [];
            const newHistory = [...history, { ...sessionData, timestamp: Date.now() }];

            // Limit history to last 50 sessions
            if (newHistory.length > 50) newHistory.shift();

            // Calculate aggregated stats
            const totalSessions = (prev.conversationStats?.totalSessions || 0) + 1;
            const currentAvgAcc = prev.conversationStats?.avgAccuracy || 0;
            const currentAvgFlu = prev.conversationStats?.avgFluency || 0;

            // Moving average
            const newAvgAcc = ((currentAvgAcc * (totalSessions - 1)) + (sessionData.metrics?.accuracy || 0)) / totalSessions;
            const newAvgFlu = ((currentAvgFlu * (totalSessions - 1)) + (sessionData.metrics?.fluency || 0)) / totalSessions;

            return {
                ...prev,
                conversationHistory: newHistory,
                conversationStats: {
                    totalSessions,
                    avgAccuracy: newAvgAcc,
                    avgFluency: newAvgFlu
                },
                conversationsCompleted: (prev.conversationsCompleted || 0) + 1,
                updatedAt: Date.now()
            };
        });
    }, []);

    // Concept Mastery Tracking (Smart Review 2.0)
    const logConceptAttempt = useCallback((conceptId, isCorrect, responseTimeMs = 0) => {
        setStats(prev => {
            const currentConcept = prev.conceptMastery?.[conceptId] || {
                interval: 0,
                repetition: 0,
                ef: 2.5,
                dueDate: 0,
                attempts: 0,
                correct: 0,
                lastPracticed: null,
                masteryLevel: 0
            };

            const grade = isCorrect ? (responseTimeMs < 3000 ? 5 : 4) : 1;

            // Calculate new state
            const attempts = currentConcept.attempts + 1;
            const correct = currentConcept.correct + (isCorrect ? 1 : 0);
            let { interval, repetition, ef } = currentConcept;

            if (isCorrect) {
                if (repetition === 0) interval = 1;
                else if (repetition === 1) interval = 3;
                else if (repetition === 2) interval = 7;
                else interval = Math.round(interval * ef * 0.9);
                repetition += 1;
            } else {
                repetition = 0;
                interval = 1;
            }

            // Update ease factor
            ef = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
            if (ef < 1.3) ef = 1.3;

            // Calculate mastery level
            const accuracy = attempts > 0 ? correct / attempts : 0;
            const recencyBonus = repetition >= 3 ? 20 : repetition * 5;
            const masteryLevel = Math.min(100, Math.round(accuracy * 80 + recencyBonus));

            const DAY_MS = 24 * 60 * 60 * 1000;

            return {
                ...prev,
                conceptMastery: {
                    ...prev.conceptMastery,
                    [conceptId]: {
                        interval,
                        repetition,
                        ef,
                        dueDate: Date.now() + interval * DAY_MS,
                        attempts,
                        correct,
                        lastPracticed: Date.now(),
                        masteryLevel
                    }
                },
                updatedAt: Date.now()
            };
        });
    }, []);

    // Get weak concepts that need review
    const getWeakConceptsList = useCallback(() => {
        const conceptMastery = stats.conceptMastery || {};
        const weakConcepts = [];
        const now = Date.now();
        const masteryThreshold = 70;

        for (const [conceptId, state] of Object.entries(conceptMastery)) {
            if (!state) continue;

            const isWeak = state.masteryLevel < masteryThreshold;
            const isOverdue = state.dueDate && now > state.dueDate;
            const hasEnoughData = state.attempts >= 3;

            if ((isWeak || isOverdue) && hasEnoughData) {
                weakConcepts.push({
                    conceptId,
                    ...state,
                    isOverdue
                });
            }
        }

        return weakConcepts.sort((a, b) => a.masteryLevel - b.masteryLevel);
    }, [stats.conceptMastery]);

    // Learning Profile Management
    const setLearningProfile = useCallback((profile) => {
        setStats(prev => ({
            ...prev,
            learningProfile: {
                ...prev.learningProfile,
                ...profile,
                completed: true,
                completedAt: Date.now()
            },
            updatedAt: Date.now()
        }));
    }, []);

    // Global Difficulty (0-100)
    const setGlobalDifficulty = useCallback((value) => {
        const clampedValue = Math.max(0, Math.min(100, value));
        setStats(prev => ({
            ...prev,
            globalDifficulty: clampedValue,
            updatedAt: Date.now()
        }));
    }, []);

    // Weekly Goal Management
    const getWeekStart = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday.toISOString();
    };

    const updateWeeklyGoal = useCallback((sessionsPerWeek) => {
        setStats(prev => ({
            ...prev,
            weeklyGoal: {
                ...prev.weeklyGoal,
                sessionsPerWeek: Math.max(1, Math.min(7, sessionsPerWeek))
            },
            updatedAt: Date.now()
        }));
    }, []);

    const recordWeeklySession = useCallback(() => {
        const currentWeekStart = getWeekStart();
        const today = new Date().toDateString();

        setStats(prev => {
            const weeklyGoal = prev.weeklyGoal || {};
            let sessionsThisWeek = weeklyGoal.sessionsThisWeek || [];

            // Reset if new week
            if (weeklyGoal.currentWeekStart !== currentWeekStart) {
                const wasComplete = sessionsThisWeek.length >= (weeklyGoal.sessionsPerWeek || 3);
                sessionsThisWeek = [];
                return {
                    ...prev,
                    weeklyGoal: {
                        ...weeklyGoal,
                        currentWeekStart,
                        sessionsThisWeek: [today],
                        lastWeekCompleted: wasComplete
                    },
                    updatedAt: Date.now()
                };
            }

            // Add today if not already recorded
            if (!sessionsThisWeek.includes(today)) {
                sessionsThisWeek = [...sessionsThisWeek, today];
            }

            return {
                ...prev,
                weeklyGoal: {
                    ...weeklyGoal,
                    currentWeekStart,
                    sessionsThisWeek
                },
                updatedAt: Date.now()
            };
        });
    }, []);

    const isWeeklyGoalMet = useCallback(() => {
        const weeklyGoal = stats.weeklyGoal || {};
        const currentWeekStart = getWeekStart();
        if (weeklyGoal.currentWeekStart !== currentWeekStart) return false;
        return (weeklyGoal.sessionsThisWeek || []).length >= (weeklyGoal.sessionsPerWeek || 3);
    }, [stats.weeklyGoal]);

    // Focus Mode Stats
    const recordFocusModeCompletion = useCallback((mode, timeSpentMs) => {
        setStats(prev => ({
            ...prev,
            focusModeStats: {
                ...prev.focusModeStats,
                [mode]: {
                    completed: (prev.focusModeStats?.[mode]?.completed || 0) + 1,
                    totalTime: (prev.focusModeStats?.[mode]?.totalTime || 0) + timeSpentMs
                }
            },
            updatedAt: Date.now()
        }));
    }, []);

    // Generic updateStats function for flexible state updates
    const updateStats = useCallback((updates) => {
        setStats(prev => ({
            ...prev,
            ...updates,
            updatedAt: Date.now()
        }));
    }, []);

    // Cultural Mastery Phase 8
    const updateRegionProgress = useCallback((regionId, progress) => {
        setStats(prev => ({
            ...prev,
            regionProgress: {
                ...prev.regionProgress,
                [regionId]: Math.max(prev.regionProgress?.[regionId] || 0, progress)
            },
            updatedAt: Date.now()
        }));
    }, []);

    const updateMediaProgress = useCallback((clipId, watched, quizScore) => {
        setStats(prev => {
            const current = prev.mediaProgress?.[clipId] || { watched: false, quizScore: 0 };
            return {
                ...prev,
                mediaProgress: {
                    ...prev.mediaProgress,
                    [clipId]: {
                        watched: watched || current.watched,
                        quizScore: Math.max(current.quizScore, quizScore)
                    }
                },
                updatedAt: Date.now()
            };
        });
    }, []);

    const updateSurvivalBest = useCallback((scenarioId, timeRemaining) => {
        setStats(prev => ({
            ...prev,
            survivalBest: {
                ...prev.survivalBest,
                [scenarioId]: Math.max(prev.survivalBest?.[scenarioId] || 0, timeRemaining)
            },
            updatedAt: Date.now()
        }));
    }, []);

    const updateCognitiveState = useCallback((newState) => {
         setStats(prev => ({
             ...prev,
             cognitiveStats: { ...prev.cognitiveStats, ...newState },
             updatedAt: Date.now()
         }));
    }, []);

    const logDreamGoal = useCallback((goalId) => {
        setStats(prev => ({
            ...prev,
            dreamGoals: { ...prev.dreamGoals, [goalId]: Date.now() },
            updatedAt: Date.now()
        }));
    }, []);

    const updateMemoryPalaceRoom = useCallback((roomId, data) => {
        setStats(prev => ({
             ...prev,
             memoryPalace: {
                 ...prev.memoryPalace,
                 rooms: {
                     ...prev.memoryPalace?.rooms,
                     [roomId]: data
                 }
             },
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
            achievements: stats.unlockedAchievements || [],
            hydrateProgress,
            completeOnboarding,
            applyPlacementResult,
            setTargetCefr,
            setWeeklyGoal,
            setModeDifficulty,
            recordCategoryPerformance,
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
            reviewQueue: stats.reviewQueue || [],
            addToReviewQueue,
            removeFromReviewQueue,
            dailyXPGoal: stats.dailyXPGoal || 50,
            updateDailyXPGoal: updateDailyXPGoalFn,
            trackConversationSession,
            conversationHistory: stats.conversationHistory || [],
            conversationStats: stats.conversationStats || {},
            // Learning Profile
            learningProfile: stats.learningProfile || {},
            setLearningProfile,
            // Global Difficulty
            globalDifficulty: stats.globalDifficulty ?? 25,
            setGlobalDifficulty,
            // Weekly Goals
            weeklyGoal: stats.weeklyGoal || { sessionsPerWeek: 3, sessionsThisWeek: [] },
            updateWeeklyGoal,
            recordWeeklySession,
            isWeeklyGoalMet,
            // Focus Mode Stats
            focusModeStats: stats.focusModeStats || {},
            recordFocusModeCompletion,
            // Concept Mastery (Smart Review 2.0)
            conceptMastery: stats.conceptMastery || {},
            logConceptAttempt,
            getWeakConceptsList,
            // Generic state updater
            updateStats,
            // Immersive Content Library
            branchingStoriesProgress: stats.branchingStoriesProgress || {},
            readingRoomProgress: stats.readingRoomProgress || {},
            shadowingProgress: stats.shadowingProgress || {},
            cultureArticlesRead: stats.cultureArticlesRead || [],
            userLessonsCreated: stats.userLessonsCreated || 0,
            // Cultural Mastery Phase 8
            regionProgress: stats.regionProgress || {},
            mediaProgress: stats.mediaProgress || {},
            survivalBest: stats.survivalBest || {},
            updateRegionProgress,
            updateMediaProgress,
            updateSurvivalBest,
            // Cognitive Phase 12
            updateCognitiveState,
            logDreamGoal,
            updateMemoryPalaceRoom,
            cognitiveStats: stats.cognitiveStats || {},
            dreamGoals: stats.dreamGoals || {},
            memoryPalace: stats.memoryPalace || {}
        }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => useContext(ProgressContext);
