import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useProgress } from './ProgressContext';
import { vocabularyList, CATEGORIES, getVocabularyByCategory, getAllCategories } from '../data/vocabulary';
import { buildPracticeQueue } from '../utils/practiceQueue';

const VocabularyContext = createContext();

// Map imported vocabulary to include SRS fields
const INITIAL_VOCABULARY = vocabularyList.map(word => ({
    ...word,
    level: 1,
    nextReview: 0,
    lastSeen: null,
    lastPracticed: null,
    pinned: false,
    snoozeUntil: null,
    lastLapsed: null,
    lapseCount: 0
}));

const normalizeWord = (word) => ({
    ...word,
    level: word.level || 1,
    nextReview: word.nextReview || 0,
    lastSeen: word.lastSeen || null,
    lastPracticed: word.lastPracticed || null,
    pinned: word.pinned || false,
    snoozeUntil: word.snoozeUntil || null,
    lastLapsed: word.lastLapsed || null,
    lapseCount: word.lapseCount || 0
});

export const VocabularyProvider = ({ children }) => {
    const { addXP } = useProgress();
    const [vocabulary, setVocabulary] = useState(() => {
        const saved = localStorage.getItem('frenchApp_vocab');
        const parsed = saved ? JSON.parse(saved) : INITIAL_VOCABULARY;
        return parsed.map(normalizeWord);
    });
    const vocabularyRef = useRef(vocabulary);

    useEffect(() => {
        localStorage.setItem('frenchApp_vocab', JSON.stringify(vocabulary));
        vocabularyRef.current = vocabulary;
    }, [vocabulary]);

    const resetVocabulary = () => {
        setVocabulary(INITIAL_VOCABULARY);
        localStorage.setItem('frenchApp_vocab', JSON.stringify(INITIAL_VOCABULARY));
    };

    const updateWordProgress = useCallback((wordId, success) => {
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
                lastSeen: now,
                lastPracticed: now,
                nextReview: nextReviewTime,
                snoozeUntil: success ? null : word.snoozeUntil,
                lastLapsed: success ? word.lastLapsed : now,
                lapseCount: success ? word.lapseCount : (word.lapseCount || 0) + 1
            };
        }));

        if (success) {
            addXP(10);
        }
    }, [addXP]);

    const markWordSeen = useCallback((wordId) => {
        const now = Date.now();
        setVocabulary(prev => prev.map(word => word.id === wordId ? { ...word, lastSeen: now } : word));
    }, []);

    const togglePinWord = useCallback((wordId) => {
        setVocabulary(prev => prev.map(word => word.id === wordId ? {
            ...word,
            pinned: !word.pinned,
            snoozeUntil: !word.pinned ? null : word.snoozeUntil
        } : word));
    }, []);

    const snoozeWord = useCallback((wordId, durationMs = 6 * 60 * 60 * 1000) => {
        const until = Date.now() + durationMs;
        setVocabulary(prev => prev.map(word => word.id === wordId ? {
            ...word,
            snoozeUntil: until,
            pinned: false
        } : word));
    }, []);

    const clearSnooze = useCallback((wordId) => {
        setVocabulary(prev => prev.map(word => word.id === wordId ? {
            ...word,
            snoozeUntil: null
        } : word));
    }, []);

    const getDueWords = useCallback(() => {
        const now = Date.now();
        return vocabularyRef.current.filter(word => (!word.snoozeUntil || word.snoozeUntil <= now) && word.nextReview <= now);
    }, []);

    const getPracticeQueue = useCallback((mode = 'default', limit) => {
        return buildPracticeQueue(vocabularyRef.current, mode, limit);
    }, []);

    return (
        <VocabularyContext.Provider value={{
            vocabulary,
            updateWordProgress,
            markWordSeen,
            togglePinWord,
            snoozeWord,
            clearSnooze,
            getDueWords,
            getPracticeQueue,
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
