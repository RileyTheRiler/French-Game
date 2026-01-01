import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useProgress } from './ProgressContext';
import { vocabularyList, CATEGORIES, getVocabularyByCategory, getAllCategories } from '../data/vocabulary';
import { speak } from '../utils/audio';

const VocabularyContext = createContext();

// Map imported vocabulary to include SRS fields
const INITIAL_VOCABULARY = vocabularyList.map(word => ({
    ...word,
    level: 1,
    nextReview: 0
}));

export const VocabularyProvider = ({ children }) => {
    const { addXP } = useProgress();
    const audioCacheRef = useRef({});
    const [vocabulary, setVocabulary] = useState(() => {
        const saved = localStorage.getItem('frenchApp_vocab');
        if (!saved) return INITIAL_VOCABULARY;

        try {
            const parsed = JSON.parse(saved);
            const savedMap = Object.fromEntries(parsed.map(word => [word.id, word]));
            return INITIAL_VOCABULARY.map(word => ({
                ...word,
                ...(savedMap[word.id] || {})
            }));
        } catch {
            return INITIAL_VOCABULARY;
        }
    });

    useEffect(() => {
        localStorage.setItem('frenchApp_vocab', JSON.stringify(vocabulary));
    }, [vocabulary]);

    const resetVocabulary = () => {
        audioCacheRef.current = {};
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

    const isAudioEnabled = () => {
        const saved = localStorage.getItem('frenchApp_audio');
        return saved === null ? true : JSON.parse(saved);
    };

    const buildAudioElement = (word) => {
        if (!word?.audioUrl) return null;
        const audio = new Audio(word.audioUrl);
        audio.preload = 'auto';
        audioCacheRef.current[word.id] = audio;
        return audio;
    };

    const preloadAudioForWords = (words = []) => {
        words.forEach(word => {
            if (!word) return;
            if (!audioCacheRef.current[word.id]) {
                buildAudioElement(word);
            }
        });
    };

    const playWordAudio = (wordOrId) => {
        if (!isAudioEnabled()) return;

        const word = typeof wordOrId === 'string'
            ? vocabulary.find(entry => entry.id === wordOrId)
            : wordOrId;

        if (!word) return;

        const cached = audioCacheRef.current[word.id] || buildAudioElement(word);

        if (cached) {
            cached.currentTime = 0;
            cached.play().catch(() => speak(word.french));
            return;
        }

        speak(word.french);
    };

    const getDueWords = () => {
        const now = Date.now();
        return vocabulary.filter(word => word.nextReview <= now);
    };

    useEffect(() => {
        preloadAudioForWords(getDueWords());
    }, []);

    return (
        <VocabularyContext.Provider value={{
            vocabulary,
            updateWordProgress,
            getDueWords,
            resetVocabulary,
            CATEGORIES,
            getVocabularyByCategory,
            getAllCategories,
            preloadAudioForWords,
            playWordAudio
        }}>
            {children}
        </VocabularyContext.Provider>
    );
};

export const useVocabulary = () => useContext(VocabularyContext);
