import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProgress } from './ProgressContext';
import { vocabularyList, CATEGORIES, getVocabularyByCategory, getAllCategories } from '../data/vocabulary';

const VocabularyContext = createContext();

// Map imported vocabulary to include SRS fields
const INITIAL_VOCABULARY = vocabularyList.map(word => ({
    ...word,
    level: 1,
    nextReview: 0
}));

export const VocabularyProvider = ({ children }) => {
    const { addXP } = useProgress();
    const [vocabulary, setVocabulary] = useState(() => {
        const saved = localStorage.getItem('frenchApp_vocab');
        return saved ? JSON.parse(saved) : INITIAL_VOCABULARY;
    });

    useEffect(() => {
        localStorage.setItem('frenchApp_vocab', JSON.stringify(vocabulary));
    }, [vocabulary]);

    const resetVocabulary = () => {
        setVocabulary(INITIAL_VOCABULARY);
        localStorage.setItem('frenchApp_vocab', JSON.stringify(INITIAL_VOCABULARY));
    };

    const updateWordProgress = (wordId, success) => {
        setVocabulary(prev => prev.map(word => {
            if (word.id !== wordId) return word;

            // Leitner System Intervals (in milliseconds)
            const SRS_INTERVALS = {
                1: 24 * 60 * 60 * 1000,       // 1 Day
                2: 3 * 24 * 60 * 60 * 1000,   // 3 Days
                3: 7 * 24 * 60 * 60 * 1000,   // 7 Days
                4: 14 * 24 * 60 * 60 * 1000,  // 14 Days
                5: 30 * 24 * 60 * 60 * 1000   // 30 Days
            };

            let newLevel = word.level;
            if (success) {
                newLevel = Math.min(word.level + 1, 5);
            } else {
                newLevel = 1; // Reset to level 1 on failure
            }

            const now = Date.now();
            const nextReviewTime = now + (SRS_INTERVALS[newLevel] || SRS_INTERVALS[1]);

            return {
                ...word,
                level: newLevel,
                lastPracticed: now,
                nextReview: nextReviewTime
            };
        }));

        if (success) {
            addXP(10);
        }
    };

    const getDueWords = () => {
        const now = Date.now();
        return vocabulary.filter(word => word.nextReview <= now);
    };

    return (
        <VocabularyContext.Provider value={{
            vocabulary,
            updateWordProgress,
            getDueWords,
            resetVocabulary,
            CATEGORIES,
            getVocabularyByCategory,
            getAllCategories
        }}>
            {children}
        </VocabularyContext.Provider>
    );
};

export const useVocabulary = () => useContext(VocabularyContext);
