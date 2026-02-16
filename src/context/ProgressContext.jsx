/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { calculateLevel, getLevelProgress } from '../utils/gamificationUtils';
import { ACHIEVEMENTS } from '../data/achievements';
import { checkStreakMilestone } from '../data/leagues';
import { useToast } from './ToastContext';

export const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
    const { showAchievement, showSuccess } = useToast();

    const defaultStats = useMemo(() => ({
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
        categoryPerformance: {},
        weeklyGoal: {
            sessions: 5,
            minutes: 120,
            sessionsPerWeek: 3,
            currentWeekStart: null,
            sessionsThisWeek: [],
            lastWeekCompleted: false
        },
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
        survivalBest: {},
        seasonEndsAt: null,
        seasonId: null,
        lastWeeklyRecap: null
    }), []);

    const [stats, setStats] = useState(() => {
        try {
            const saved = localStorage.getItem('frenchApp_progress');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    ...defaultStats,
                    ...parsed,
                    inventory: { ...defaultStats.inventory, ...(parsed.inventory || {}) },
                    weeklyGoal: { ...defaultStats.weeklyGoal, ...(parsed.weeklyGoal || {}) },
                    categoryPerformance: parsed.categoryPerformance || defaultStats.categoryPerformance,
                    difficultySettings: { ...defaultStats.difficultySettings, ...(parsed.difficultySettings || {}) },
                    dailyStats: parsed.dailyStats || {},
                    errorPatterns: parsed.errorPatterns || {},
                    lastWeeklyRecap: parsed.lastWeeklyRecap || null,
                    cognitiveStats: { ...defaultStats.cognitiveStats, ...(parsed.cognitiveStats || {}) },
                    dreamGoals: { ...defaultStats.dreamGoals, ...(parsed.dreamGoals || {}) },
                    memoryPalace: { ...defaultStats.memoryPalace, ...(parsed.memoryPalace || {}) }
                };
            }
        } catch (e) {
            console.error("Failed to parse saved progress", e);
        }
        return defaultStats;
    });

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            localStorage.setItem('frenchApp_progress', JSON.stringify(stats));
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [stats]);

    // Also save on unmount/page hide to ensure data isn't lost
    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.setItem('frenchApp_progress', JSON.stringify(stats));
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [stats]);

    // Audio & Theme State
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

    const toggleAudio = useCallback(() => setAudioEnabled(prev => !prev), []);
    const toggleOfflineAudio = useCallback(() => setOfflineAudio(prev => !prev), []);
    const toggleReducedMotion = useCallback(() => setReducedMotion(prev => !prev), []);
    const switchColorTheme = useCallback((theme) => setColorTheme(theme), []);

    const checkStreak = useCallback(() => {
        const today = new Date().toDateString();
        const lastLogin = stats.lastLoginDate;

        if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let newStats = {};

            if (lastLogin === yesterday.toDateString()) {
                // Maintained streak
            } else if (lastLogin && new Date(lastLogin) < yesterday) {
                if (stats.inventory?.['streak_freeze'] > 0) {
                    newStats = {
                        inventory: {
                            ...stats.inventory,
                            'streak_freeze': stats.inventory['streak_freeze'] - 1
                        },
                        frozenUsed: true
                    };
                } else {
                    newStats = { streak: 0 };
                }
            }
            setStats(prev => ({ ...prev, ...newStats, lastLoginDate: today, updatedAt: Date.now() }));
        }
    }, [stats.lastLoginDate, stats.inventory]);

    // Check streak on mount - use timeout to avoid synchronous setState warning
    useEffect(() => {
        const timer = setTimeout(() => {
            checkStreak();
        }, 0);
        return () => clearTimeout(timer);
    }, [checkStreak]); // Run once on mount

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

    // Ensure season window on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            ensureSeasonWindow();
        }, 0);
        return () => clearTimeout(timer);
    }, [ensureSeasonWindow]);

    const updateDailyStat = useCallback((statName, amount = 1, mode = 'add') => {
        setStats(prev => {
            const today = new Date().toDateString();
            const currentDaily = prev.dailyStats?.[today] || {};
            const currentValue = currentDaily[statName] || 0;
            const nextValue = mode === 'max' ? Math.max(currentValue, amount) : currentValue + amount;
            return {
                ...prev,
                dailyStats: {
                    ...prev.dailyStats,
                    [today]: {
                        ...currentDaily,
                        [statName]: nextValue
                    }
                },
                updatedAt: Date.now()
            };
        });
    }, []);

    const addXP = useCallback((amount) => {
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
    }, [ensureSeasonWindow, stats.doubleXpUntil]);

    const activateDoubleXP = useCallback((durationMinutes = 15) => {
        const expiresAt = Date.now() + (durationMinutes * 60 * 1000);
        setStats(prev => ({
            ...prev,
            doubleXpUntil: expiresAt,
            updatedAt: Date.now()
        }));
    }, []);

    const incrementStat = useCallback((statName, amount = 1) => {
        setStats(prev => ({
            ...prev,
            [statName]: (prev[statName] || 0) + amount,
            updatedAt: Date.now()
        }));
    }, []);

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
                    if (ach) showAchievement(ach);
                    return sum + (ach?.xpReward || 0);
                }, 0),
                updatedAt: Date.now()
            }));
            return newUnlocks;
        }
        return [];
    }, [stats, showAchievement]);

    useEffect(() => {
        const timer = setTimeout(() => {
            checkAchievements();
        }, 0);
        return () => clearTimeout(timer);
    }, [checkAchievements]);


    const addCoins = useCallback((amount) => {
        const today = new Date().toDateString();
        setStats(prev => {
            const currentDaily = prev.dailyStats?.[today] || {};
            const coinsAlreadyEarned = currentDaily.coinsEarned || 0;

            // Soft Cap Logic
            let multiplier = 1.0;
            if (coinsAlreadyEarned >= 250) {
                multiplier = 0.1;
            } else if (coinsAlreadyEarned >= 100) {
                multiplier = 0.5;
            }
            const effectiveAmount = Math.ceil(amount * multiplier);

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
    }, []);

    const spendCoins = useCallback((amount) => {
        if (stats.coins >= amount) {
            setStats(prev => ({
                ...prev,
                coins: prev.coins - amount,
                updatedAt: Date.now()
            }));
            return true;
        }
        return false;
    }, [stats.coins]);

    const buyItem = useCallback((item) => {
        const cost = item.price || item.basePrice;
        if (stats.coins >= cost) {
            setStats(prev => {
                const currentInventory = prev.inventory || {};
                let newInventoryData = 0;
                if (item.type === 'cosmetic') {
                    newInventoryData = 1;
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
    }, [stats.coins]);

    const consumeItem = useCallback((itemId, amount = 1) => {
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
    }, [stats.inventory]);

    const incrementStreak = useCallback(() => {
        const today = new Date().toDateString();
        setStats(prev => {
            if (prev.lastStreakDate === today) return prev;
            const newStreak = prev.streak + 1;
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
    }, [showSuccess]);

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

    const resetProgress = useCallback((resetStats) => {
        setStats({ ...defaultStats });
    }, [defaultStats]);

    const setTargetCefr = useCallback((level = 'B1') => {
        setStats(prev => ({ ...prev, targetCefr: level }));
    }, []);

    const setWeeklyGoal = useCallback((goal = {}) => {
        setStats(prev => ({
            ...prev,
            weeklyGoal: { ...prev.weeklyGoal, ...goal }
        }));
    }, []);

    const setModeDifficulty = useCallback((mode, value) => {
        setStats(prev => ({
            ...prev,
            difficultySettings: { ...prev.difficultySettings, [mode]: value }
        }));
    }, []);

    const recordCategoryPerformance = useCallback((category, { success = false, responseTime = 0, mode = 'general' } = {}) => {
        if (!category) return;
        setStats(prev => {
            const existing = prev.categoryPerformance?.[category] || {
                attempts: 0, correct: 0, totalResponseTime: 0, lastResponseTime: 0, lastMode: mode
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
    }, []);

    const hydrateProgress = useCallback((incomingStats) => {
        if (!incomingStats) return;
        setStats(prev => ({
            ...prev,
            ...incomingStats,
            updatedAt: incomingStats.updatedAt || Date.now()
        }));
    }, []);

    const logWordAttempt = useCallback((category, isCorrect, responseTimeMs, wordId) => {
        setStats(prev => {
            const today = new Date().toDateString();
            const currentCatStats = prev.categoryStats?.[category] || { attempts: 0, correct: 0, totalResponseTime: 0 };
            const currentDaily = prev.dailyStats?.[today] || { xp: 0, words: 0, accuracy: 0, time: 0, attempts: 0, correct: 0 };
            let newErrorPatterns = { ...prev.errorPatterns };
            if (!isCorrect && wordId) {
                const currentError = newErrorPatterns[wordId] || { count: 0, lastMiss: 0 };
                newErrorPatterns[wordId] = {
                    count: currentError.count + 1,
                    lastMiss: Date.now()
                };
            }
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

    const markWeeklyRecapSeen = useCallback(() => {
        setStats(prev => ({ ...prev, lastWeeklyRecap: new Date().toDateString() }));
    }, []);

    const updateDifficultySettings = useCallback((newSettings) => {
        setStats(prev => ({
            ...prev,
            difficultySettings: { ...prev.difficultySettings, ...newSettings },
            updatedAt: Date.now()
        }));
    }, []);

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
            if (newHistory.length > 50) newHistory.shift();
            const totalSessions = (prev.conversationStats?.totalSessions || 0) + 1;
            const currentAvgAcc = prev.conversationStats?.avgAccuracy || 0;
            const currentAvgFlu = prev.conversationStats?.avgFluency || 0;
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

    const logConceptAttempt = useCallback((conceptId, isCorrect, responseTimeMs = 0) => {
        setStats(prev => {
            const currentConcept = prev.conceptMastery?.[conceptId] || {
                interval: 0, repetition: 0, ef: 2.5, dueDate: 0, attempts: 0, correct: 0, lastPracticed: null, masteryLevel: 0
            };
            const grade = isCorrect ? (responseTimeMs < 3000 ? 5 : 4) : 1;
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
            ef = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
            if (ef < 1.3) ef = 1.3;
            const accuracy = attempts > 0 ? correct / attempts : 0;
            const recencyBonus = repetition >= 3 ? 20 : repetition * 5;
            const masteryLevel = Math.min(100, Math.round(accuracy * 80 + recencyBonus));
            const DAY_MS = 24 * 60 * 60 * 1000;
            return {
                ...prev,
                conceptMastery: {
                    ...prev.conceptMastery,
                    [conceptId]: {
                        interval, repetition, ef, dueDate: Date.now() + interval * DAY_MS, attempts, correct, lastPracticed: Date.now(), masteryLevel
                    }
                },
                updatedAt: Date.now()
            };
        });
    }, []);

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
                weakConcepts.push({ conceptId, ...state, isOverdue });
            }
        }
        return weakConcepts.sort((a, b) => a.masteryLevel - b.masteryLevel);
    }, [stats.conceptMastery]);

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

    const setGlobalDifficulty = useCallback((value) => {
        const clampedValue = Math.max(0, Math.min(100, value));
        setStats(prev => ({
            ...prev,
            globalDifficulty: clampedValue,
            updatedAt: Date.now()
        }));
    }, []);

    const getWeekStart = useCallback(() => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday.toISOString();
    }, []);

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
            if (!sessionsThisWeek.includes(today)) {
                sessionsThisWeek = [...sessionsThisWeek, today];
            }
            return {
                ...prev,
                weeklyGoal: { ...weeklyGoal, currentWeekStart, sessionsThisWeek },
                updatedAt: Date.now()
            };
        });
    }, [getWeekStart]);

    const isWeeklyGoalMet = useCallback(() => {
        const weeklyGoal = stats.weeklyGoal || {};
        const currentWeekStart = getWeekStart();
        if (weeklyGoal.currentWeekStart !== currentWeekStart) return false;
        return (weeklyGoal.sessionsThisWeek || []).length >= (weeklyGoal.sessionsPerWeek || 3);
    }, [stats.weeklyGoal, getWeekStart]);

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

    const updateStats = useCallback((updates) => {
        setStats(prev => ({ ...prev, ...updates, updatedAt: Date.now() }));
    }, []);

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

    const updateCognitiveState = useCallback((updates) => {
        setStats(prev => ({
            ...prev,
            cognitiveStats: {
                ...prev.cognitiveStats,
                ...updates
            },
            updatedAt: Date.now()
        }));
    }, []);

    const logDreamGoal = useCallback((goalId) => {
        setStats(prev => ({
            ...prev,
            dreamGoals: {
                ...prev.dreamGoals,
                [goalId]: Date.now()
            },
            updatedAt: Date.now()
        }));
    }, []);

    const updateMemoryPalaceRoom = useCallback((roomId, data) => {
        setStats(prev => ({
            ...prev,
            memoryPalace: {
                ...prev.memoryPalace,
                rooms: { ...prev.memoryPalace.rooms, [roomId]: data }
            },
            updatedAt: Date.now()
        }));
    }, []);

    const level = calculateLevel(stats.xp);
    const progressToNextLevel = getLevelProgress(stats.xp);

    const contextValue = useMemo(() => ({
        stats, level, progressToNextLevel, addXP, incrementStreak, incrementDailyMixStreak,
        audioEnabled, toggleAudio, offlineAudio, toggleOfflineAudio, reducedMotion, toggleReducedMotion,
        colorTheme, switchColorTheme, resetProgress, addCoins, spendCoins, buyItem, consumeItem,
        incrementStat, checkAchievements, activateDoubleXP,
        isDoubleXpActive: () => stats.doubleXpUntil && Date.now() < stats.doubleXpUntil,
        updateDailyStat, achievements: stats.unlockedAchievements || [], hydrateProgress,
        completeOnboarding, applyPlacementResult, setTargetCefr, setWeeklyGoal, setModeDifficulty,
        recordCategoryPerformance, logWordAttempt, updateUserGoals, userGoals: stats.userGoals,
        updateDifficultySettings, difficultySettings: stats.difficultySettings, categoryStats: stats.categoryStats,
        dailyStats: stats.dailyStats, errorPatterns: stats.errorPatterns, getWeeklySummary,
        lastWeeklyRecap: stats.lastWeeklyRecap, markWeeklyRecapSeen, weakWords: stats.weakWords,
        markWordStrength, reviewQueue: stats.reviewQueue || [], addToReviewQueue, removeFromReviewQueue,
        dailyXPGoal: stats.dailyXPGoal || 50, updateDailyXPGoal: updateDailyXPGoalFn,
        trackConversationSession, conversationHistory: stats.conversationHistory || [],
        conversationStats: stats.conversationStats || {}, learningProfile: stats.learningProfile || {},
        setLearningProfile, globalDifficulty: stats.globalDifficulty ?? 25, setGlobalDifficulty,
        weeklyGoal: stats.weeklyGoal || { sessionsPerWeek: 3, sessionsThisWeek: [] },
        updateWeeklyGoal, recordWeeklySession, isWeeklyGoalMet, focusModeStats: stats.focusModeStats || {},
        recordFocusModeCompletion, conceptMastery: stats.conceptMastery || {}, logConceptAttempt,
        getWeakConceptsList, updateStats, branchingStoriesProgress: stats.branchingStoriesProgress || {},
        readingRoomProgress: stats.readingRoomProgress || {}, shadowingProgress: stats.shadowingProgress || {},
        cultureArticlesRead: stats.cultureArticlesRead || [], userLessonsCreated: stats.userLessonsCreated || 0,
        regionProgress: stats.regionProgress || {}, mediaProgress: stats.mediaProgress || {},
        survivalBest: stats.survivalBest || {}, updateRegionProgress, updateMediaProgress,
        updateSurvivalBest, updateCognitiveState, logDreamGoal, updateMemoryPalaceRoom,
        cognitiveStats: stats.cognitiveStats || {}, dreamGoals: stats.dreamGoals || {},
        memoryPalace: stats.memoryPalace || {}
    }), [
        stats, level, progressToNextLevel, addXP, incrementStreak, incrementDailyMixStreak,
        audioEnabled, toggleAudio, offlineAudio, toggleOfflineAudio, reducedMotion, toggleReducedMotion,
        colorTheme, switchColorTheme, resetProgress, addCoins, spendCoins, buyItem, consumeItem,
        incrementStat, checkAchievements, activateDoubleXP, updateDailyStat, hydrateProgress,
        completeOnboarding, applyPlacementResult, setTargetCefr, setWeeklyGoal, setModeDifficulty,
        recordCategoryPerformance, logWordAttempt, updateUserGoals, updateDifficultySettings,
        updateDailyXPGoalFn, trackConversationSession, setLearningProfile, setGlobalDifficulty,
        updateWeeklyGoal, recordWeeklySession, isWeeklyGoalMet, recordFocusModeCompletion,
        logConceptAttempt, getWeakConceptsList, updateStats, updateRegionProgress,
        updateMediaProgress, updateSurvivalBest, updateCognitiveState, logDreamGoal,
        updateMemoryPalaceRoom, getWeeklySummary, markWeeklyRecapSeen, markWordStrength,
        addToReviewQueue, removeFromReviewQueue
    ]);

    return (
        <ProgressContext.Provider value={contextValue}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => useContext(ProgressContext);
