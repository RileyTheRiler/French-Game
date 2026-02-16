import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useProgress } from './ProgressContext';
import { useVocabulary } from './VocabularyContext';
import {
    computeSkillProfile,
    getPersonalizedQueue,
    getDifficultyAdjustment,
    generateInsights,
    detectLearningStyle
} from '../services/AdaptiveLearningEngine';

const LearningPathContext = createContext();

/**
 * LearningPathProvider - Manages adaptive learning path state
 */
export const LearningPathProvider = ({ children }) => {
    const { categoryStats, dailyStats, errorPatterns, weakWords, getWeeklySummary } = useProgress();
    const { vocabulary, getWeightedPracticeWords } = useVocabulary();

    // Lazy initialization for behavior data
    const [behaviorData, setBehaviorData] = useState(() => {
        const saved = localStorage.getItem('frenchApp_behavior');
        return saved ? JSON.parse(saved) : {
            listenButtonClicks: 0,
            pronunciationAttempts: 0,
            flashcardFlips: 0,
            rhythmTrainingTime: 0,
            visualizerEngagement: 0
        };
    });

    // Compute derived state directly during render or useMemo to avoid sync setState effects
    const skillProfile = useMemo(() => {
        if (!vocabulary || vocabulary.length === 0) return null;

        const progressData = {
            categoryStats: categoryStats || {},
            errorPatterns: errorPatterns || {},
            dailyStats: dailyStats || {},
            weakWords: weakWords || {}
        };

        return computeSkillProfile(progressData, vocabulary);
    }, [vocabulary, categoryStats, dailyStats, errorPatterns, weakWords]);

    const learningStyle = useMemo(() => {
        return detectLearningStyle(behaviorData);
    }, [behaviorData]);

    const insights = useMemo(() => {
        if (!skillProfile) return [];
        const weeklyData = getWeeklySummary ? getWeeklySummary() : [];
        return generateInsights(weeklyData, skillProfile);
    }, [skillProfile, getWeeklySummary]);

    // Use a ref or state for queue if we need to modify it,
    // but initializing it from memo avoids the effect loop.
    // If we need to *modify* it (shift items), state is better.
    // We can initialize state from the memo? No, that's tricky.
    // Let's use a state that updates ONLY when dependencies change significantly or manually refreshed.
    const [contentQueue, setContentQueue] = useState(() => {
        if (skillProfile && vocabulary && vocabulary.length > 0) {
            return getPersonalizedQueue(skillProfile, vocabulary, 30);
        }
        return [];
    });

    // Update queue when profile changes, wrapped in useEffect but carefully
    useEffect(() => {
        if (skillProfile && vocabulary && vocabulary.length > 0) {
            // Only update if queue is empty or significantly stale?
            // For now, just setting it is fine as long as it doesn't cause loop.
            // Since skillProfile is memoized, this effect runs only when profile changes.
            const queue = getPersonalizedQueue(skillProfile, vocabulary, 30);
            setContentQueue(queue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skillProfile, vocabulary]);

    const [difficultyParams, setDifficultyParams] = useState({
        multiplier: 1.0,
        timerAdjustment: 0,
        hintsEnabled: true,
        encouragementLevel: 'normal'
    });

    // Save behavior data
    useEffect(() => {
        localStorage.setItem('frenchApp_behavior', JSON.stringify(behaviorData));
    }, [behaviorData]);

    // Update difficulty based on recent session performance
    const updateDifficultyFromSession = useCallback((sessionStats) => {
        const { accuracy, avgResponseTime, streakLength } = sessionStats;
        const adjustment = getDifficultyAdjustment({ accuracy, avgResponseTime, streakLength });
        setDifficultyParams(adjustment);
    }, []);

    // Track behavior for learning style detection
    const trackBehavior = useCallback((action, value = 1) => {
        setBehaviorData(prev => ({
            ...prev,
            [action]: (prev[action] || 0) + value
        }));
    }, []);

    // Get the next batch of personalized content
    const getNextBatch = useCallback((batchSize = 10) => {
        if (contentQueue.length >= batchSize) {
            return contentQueue.slice(0, batchSize);
        }
        // Fallback to weighted practice words if queue is low
        return getWeightedPracticeWords ? getWeightedPracticeWords(batchSize) : [];
    }, [contentQueue, getWeightedPracticeWords]);

    // Refresh the content queue
    const refreshQueue = useCallback(() => {
        if (skillProfile && vocabulary && vocabulary.length > 0) {
            const queue = getPersonalizedQueue(skillProfile, vocabulary, 30);
            setContentQueue(queue);
        }
    }, [skillProfile, vocabulary]);

    // Get focus categories (weak areas that need attention)
    const getFocusCategories = useCallback(() => {
        if (!skillProfile) return [];
        return skillProfile.weakAreas.slice(0, 3);
    }, [skillProfile]);

    // Get mastered categories
    const getMasteredCategories = useCallback(() => {
        if (!skillProfile) return [];
        return skillProfile.strongAreas;
    }, [skillProfile]);

    // Get current learning level recommendation
    const getRecommendedLevel = useCallback(() => {
        if (!skillProfile) return 'A1';
        return skillProfile.preferredDifficulty;
    }, [skillProfile]);

    // Milestones for the learning path
    const milestones = useMemo(() => {
        if (!skillProfile) {
            return [
                { id: 1, title: 'First Steps', target: 10, current: 0, type: 'wordsLearned' },
                { id: 2, title: 'Getting Comfortable', target: 50, current: 0, type: 'wordsLearned' },
                { id: 3, title: 'Building Momentum', target: 100, current: 0, type: 'wordsLearned' }
            ];
        }

        const wordsStudied = skillProfile.totalWordsStudied || 0;

        return [
            {
                id: 1,
                title: 'First Steps',
                target: 10,
                current: Math.min(wordsStudied, 10),
                type: 'wordsLearned',
                complete: wordsStudied >= 10
            },
            {
                id: 2,
                title: 'Getting Comfortable',
                target: 50,
                current: Math.min(wordsStudied, 50),
                type: 'wordsLearned',
                complete: wordsStudied >= 50
            },
            {
                id: 3,
                title: 'Building Momentum',
                target: 100,
                current: Math.min(wordsStudied, 100),
                type: 'wordsLearned',
                complete: wordsStudied >= 100
            },
            {
                id: 4,
                title: 'Vocabulary Master',
                target: 200,
                current: Math.min(wordsStudied, 200),
                type: 'wordsLearned',
                complete: wordsStudied >= 200
            },
            {
                id: 5,
                title: 'Category Champion',
                target: 3,
                current: skillProfile.strongAreas?.length || 0,
                type: 'categoriesMastered',
                complete: (skillProfile.strongAreas?.length || 0) >= 3
            }
        ];
    }, [skillProfile]);

    // Get current milestone (first incomplete)
    const currentMilestone = useMemo(() => {
        return milestones.find(m => !m.complete) || milestones[milestones.length - 1];
    }, [milestones]);

    const contextValue = useMemo(() => ({
        // Skill data
        skillProfile,
        learningStyle,

        // Difficulty
        difficultyParams,
        updateDifficultyFromSession,

        // Content
        contentQueue,
        getNextBatch,
        refreshQueue,

        // Categories
        getFocusCategories,
        getMasteredCategories,
        getRecommendedLevel,

        // Insights
        insights,

        // Milestones
        milestones,
        currentMilestone,

        // Behavior tracking
        trackBehavior,

        // Helper data
        categoryStrengths: skillProfile?.categoryStrengths || {},
        vocabularyMastery: skillProfile?.vocabularyMastery || 0,
        consistencyScore: skillProfile?.consistencyScore || 0,
        learningVelocity: skillProfile?.learningVelocity || 0.5
    }), [
        skillProfile,
        learningStyle,
        difficultyParams,
        updateDifficultyFromSession,
        contentQueue,
        getNextBatch,
        refreshQueue,
        getFocusCategories,
        getMasteredCategories,
        getRecommendedLevel,
        insights,
        milestones,
        currentMilestone,
        trackBehavior
    ]);

    return (
        <LearningPathContext.Provider value={contextValue}>
            {children}
        </LearningPathContext.Provider>
    );
};

export const useLearningPath = () => {
    const context = useContext(LearningPathContext);
    if (!context) {
        throw new Error('useLearningPath must be used within a LearningPathProvider');
    }
    return context;
};

export default LearningPathContext;
