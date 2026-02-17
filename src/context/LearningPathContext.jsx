/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useProgress } from './ProgressContext';
import { getWeeklySummary } from '../utils/analytics'; // Ensure this exists or mock it
import { detectLearningStyle, generateInsights } from '../services/AdaptiveLearningEngine';
import { getPersonalizedQueue } from '../systems/ExerciseGenerator';

const LearningPathContext = createContext();

export const LearningPathProvider = ({ children }) => {
    const {
        vocabulary, // Use raw vocabulary from context
        dailyStats,
    } = useProgress(); // Access directly from ProgressContext instead of prop drilling

    const [contentQueue, setContentQueue] = useState([]);

    // Compute Skill Profile based on detailed stats - Derived State
    const skillProfile = useMemo(() => {
        // Mock logic for now - in real app would aggregate categoryStats
        return {
            vocabulary: 0.5,
            grammar: 0.3,
            listening: 0.4,
            pronunciation: 0.2
        };
    }, []); // Removed unused dependencies

    // Generate Weekly Insights - Derived State
    const insights = useMemo(() => {
        if (skillProfile) {
            const weeklyData = getWeeklySummary ? getWeeklySummary() : [];
            return generateInsights(weeklyData, skillProfile);
        }
        return [];
    }, [skillProfile]);

    // Detect Learning Style dynamically - Derived State
    const learningStyle = useMemo(() => {
        return detectLearningStyle(dailyStats); // Using dailyStats as proxy for behaviorData
    }, [dailyStats]);

    // Update Content Queue based on Profile
    // We keep this as an effect because getPersonalizedQueue might be heavy or random
    // and we want to store the result in state to keep it stable across renders until dependencies change.
    useEffect(() => {
        if (skillProfile && vocabulary && vocabulary.length > 0) {
            // Defer queue generation to avoid blocking render
            const timer = setTimeout(() => {
                const queue = getPersonalizedQueue(skillProfile, vocabulary, 30);
                setContentQueue(queue);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [skillProfile, vocabulary]);

    // Get the next batch of personalized content
    // eslint-disable-next-line no-unused-vars
    const getNextSession = useCallback((_mode = 'mixed') => {
        if (contentQueue.length === 0) return [];

        // Filter based on mode if needed (currently unused parameter)
        return contentQueue.slice(0, 10);
    }, [contentQueue]);

    const value = {
        skillProfile,
        insights,
        learningStyle,
        getNextSession,
        contentQueue
    };

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
