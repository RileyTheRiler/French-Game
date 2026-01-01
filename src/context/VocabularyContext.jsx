import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useProgress } from './ProgressContext';
import { vocabularyList, CATEGORIES, getVocabularyByCategory, getAllCategories } from '../data/vocabulary';
import { calculateNextReview, getInitialState, isPassingGrade, normalizeGrade } from '../utils/srs';
import { speak } from '../utils/audio';

const VocabularyContext = createContext();
const DAY_MS = 24 * 60 * 60 * 1000;

const ensureSrsState = (state) => {
    const base = getInitialState();
    if (!state) return base;

    return {
        interval: state.interval ?? base.interval,
        repetition: state.repetition ?? base.repetition,
        ef: state.ef ?? base.ef,
        dueDate: state.dueDate ?? base.dueDate
    };
};

const hydrateWord = (word) => {
    const srs = ensureSrsState(word.srs);
    const level = word.level ?? Math.max(1, srs.repetition || 1);
    const nextReview = word.nextReview ?? srs.dueDate ?? 0;

    return {
        ...word,
        srs,
        level,
        nextReview,
        successStreak: word.successStreak ?? 0,
        lapses: word.lapses ?? 0,
        reviewHistory: word.reviewHistory ?? [],
        lastPracticed: word.lastPracticed ?? 0
    };
};

// Map imported vocabulary to include SRS fields
const INITIAL_VOCABULARY = vocabularyList.map(word => hydrateWord({
    ...word,
    srs: getInitialState(),
    level: 1,
    nextReview: 0,
    updatedAt: Date.now()
}));

export const VocabularyProvider = ({ children }) => {
    const { addXP } = useProgress();
    const audioCacheRef = useRef({});
    const [vocabulary, setVocabulary] = useState(() => {
        const saved = localStorage.getItem('frenchApp_vocab');
        const parsed = saved ? JSON.parse(saved) : INITIAL_VOCABULARY;
        return parsed.map(hydrateWord);
    });

    useEffect(() => {
        localStorage.setItem('frenchApp_vocab', JSON.stringify(vocabulary));
    }, [vocabulary]);

    const resetVocabulary = () => {
        const reset = INITIAL_VOCABULARY.map(word => ({ ...word, updatedAt: Date.now() }));
        setVocabulary(reset);
        localStorage.setItem('frenchApp_vocab', JSON.stringify(reset));
        audioCacheRef.current = {};
    };

    const computePriority = useCallback((word) => {
        const now = Date.now();
        const srs = ensureSrsState(word.srs);
        const dueWeight = srs.dueDate <= now ? 2 : Math.max(0.5, 1 - ((srs.dueDate - now) / (3 * DAY_MS)));

        const historyScore = (word.reviewHistory || []).reduce((score, entry) => {
            const daysAgo = (now - entry.timestamp) / DAY_MS;
            const decay = Math.max(0, 1 - (daysAgo / 7));
            return score + (entry.correct ? 0.1 : 1.4) * decay;
        }, 0);

        const struggleScore = word.lapses ? Math.log2(word.lapses + 1) * 0.2 : 0;
        const streakModifier = 1 / Math.max(1, (word.successStreak || 0) + 0.5);

        return dueWeight + historyScore + struggleScore + streakModifier;
    }, []);

    const updateWordProgress = useCallback((wordId, gradeInput) => {
        const grade = normalizeGrade(gradeInput);
        const passed = isPassingGrade(grade);
        const reviewedAt = Date.now();

        setVocabulary(prev => prev.map(word => {
            if (word.id !== wordId) return word;

            const currentSrs = ensureSrsState(word.srs);
            const nextSrs = calculateNextReview(currentSrs, grade);
            const historyEntry = { timestamp: reviewedAt, grade, correct: passed };

            return {
                ...word,
                srs: nextSrs,
                level: Math.max(1, nextSrs.repetition || 1),
                lastPracticed: reviewedAt,
                nextReview: nextSrs.dueDate,
                successStreak: passed ? (word.successStreak || 0) + 1 : 0,
                lapses: passed ? (word.lapses || 0) : (word.lapses || 0) + 1,
                reviewHistory: [historyEntry, ...(word.reviewHistory || [])].slice(0, 50)
            };
        }));

        if (passed) {
            addXP(10);
        }
    }, [addXP]);

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

    const getDueWords = useCallback(() => {
        const now = Date.now();
        return vocabulary
            .map(hydrateWord)
            .filter(word => ensureSrsState(word.srs).dueDate <= now)
            .sort((a, b) => computePriority(b) - computePriority(a));
    }, [vocabulary, computePriority]);

    const getWeightedPracticeWords = useCallback((limit = 30) => {
        return vocabulary
            .map(word => ({
                ...word,
                priorityScore: computePriority(word)
            }))
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .slice(0, limit)
            .map(hydrateWord);
    }, [vocabulary, computePriority]);

    useEffect(() => {
        preloadAudioForWords(getDueWords());
    }, []);

    const hydrateVocabulary = (incomingVocabulary) => {
        if (!incomingVocabulary) return;
        setVocabulary(incomingVocabulary);
    };

    const contextValue = useMemo(() => ({
        vocabulary,
        updateWordProgress,
        getDueWords,
        getWeightedPracticeWords,
        resetVocabulary,
        CATEGORIES,
        getVocabularyByCategory,
        getAllCategories,
        hydrateVocabulary,
        preloadAudioForWords,
        playWordAudio
    }), [vocabulary, getDueWords, getWeightedPracticeWords, updateWordProgress]);

    return (
        <VocabularyContext.Provider value={contextValue}>
            {children}
        </VocabularyContext.Provider>
    );
};

export const useVocabulary = () => useContext(VocabularyContext);
