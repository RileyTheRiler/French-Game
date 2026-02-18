import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useProgress } from './ProgressContext';
import { computeSkillProfile, getPersonalizedQueue, generateInsights, detectLearningStyle } from '../services/AdaptiveLearningEngine';

const LearningPathContext = createContext();

export const LearningPathProvider = ({ children }) => {
    const {
        stats: progressData,
        categoryStats,
        dailyStats,
        errorPatterns,
        weakWords,
        getWeeklySummary
    } = useProgress();
    const [vocabulary, setVocabulary] = useState([]);

    // State for personalized path
    const [skillProfile, setSkillProfile] = useState(null);
    const [contentQueue, setContentQueue] = useState([]);
    const [insights, setInsights] = useState([]);
    const [learningStyle, setLearningStyle] = useState(null);
    const [behaviorData, setBehaviorData] = useState({
        listenButtonClicks: 0,
        pronunciationAttempts: 0,
        flashcardFlips: 0,
        rhythmTrainingTime: 0,
        visualizerEngagement: 0
    });

    // Update behavior data (to be called by components)
    const trackBehavior = useCallback((action, value = 1) => {
        setBehaviorData(prev => ({
            ...prev,
            [action]: (prev[action] || 0) + value
        }));
    }, []);

    // Load vocabulary data (mock for now, would likely come from another context or API)
    useEffect(() => {
        // This should ideally be passed in or fetched.
        // Assuming VocabularyContext might provide this, but avoiding circular dep if possible.
        // For now, we'll wait for a setter or external update.
    }, []);

    // Provide a way to set vocabulary from outside
    const updateVocabulary = useCallback((vocabList) => {
        setVocabulary(vocabList);
    }, []);

    // Compute Skill Profile when stats change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (vocabulary.length > 0) {
                const profile = computeSkillProfile(progressData, vocabulary);
                setSkillProfile(profile);
            }
        }, 500); // Debounce to avoid rapid updates
        return () => clearTimeout(timer);
    }, [vocabulary, categoryStats, dailyStats, errorPatterns, weakWords, progressData]);

    // Generate Insights when profile changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (skillProfile) {
                const weeklyData = getWeeklySummary ? getWeeklySummary() : [];
                const newInsights = generateInsights(weeklyData, skillProfile);
                setInsights(newInsights);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [skillProfile, getWeeklySummary]);

    // Update Content Queue based on profile
    useEffect(() => {
        const timer = setTimeout(() => {
            if (skillProfile && vocabulary && vocabulary.length > 0) {
                const queue = getPersonalizedQueue(skillProfile, vocabulary, 30);
                setContentQueue(queue);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [skillProfile, vocabulary]);

    // Detect Learning Style occasionally
    useEffect(() => {
        const timer = setTimeout(() => {
            const style = detectLearningStyle(behaviorData);
            setLearningStyle(style);
        }, 2000); // Check less frequently
        return () => clearTimeout(timer);
    }, [behaviorData]);

    // Get the next batch of personalized content
    const getNextSession = useCallback((size = 10) => {
        if (contentQueue.length < size) {
            // Fallback if queue empty
            return vocabulary.slice(0, size);
        }
        return contentQueue.slice(0, size);
    }, [contentQueue, vocabulary]);

    const value = useMemo(() => ({
        skillProfile,
        contentQueue,
        insights,
        learningStyle,
        trackBehavior,
        updateVocabulary,
        getNextSession
    }), [skillProfile, contentQueue, insights, learningStyle, trackBehavior, updateVocabulary, getNextSession]);

    return (
        <LearningPathContext.Provider value={value}>
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
