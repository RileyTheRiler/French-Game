import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useProgress } from './ProgressContext';
import { vocabularyList, CATEGORIES, getVocabularyByCategory, getAllCategories } from '../data/vocabulary';
import { calculateNextReview, getInitialState, isPassingGrade, normalizeGrade } from '../utils/srs';
import { speak, cacheVocabularyAudio } from '../utils/audio';
import { buildPracticeQueue } from '../utils/practiceQueue';

// eslint-disable-next-line react-refresh/only-export-components
export const VocabularyContext = createContext();
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
        lastPracticed: word.lastPracticed ?? 0,
        lastSeen: word.lastSeen || null,
        pinned: word.pinned || false,
        snoozeUntil: word.snoozeUntil || null,
        isCustom: word.isCustom || false
    };
};

// Map imported vocabulary to include SRS fields
const INITIAL_VOCABULARY = vocabularyList.map(hydrateWord);

export const VocabularyProvider = ({ children }) => {
    const { addXP } = useProgress();
    const audioCacheRef = useRef({});

    const [vocabulary, setVocabulary] = useState(() => {
        const saved = localStorage.getItem('frenchApp_vocab');
        const base = saved ? JSON.parse(saved) : INITIAL_VOCABULARY;
        return base.map(hydrateWord);
    });

    // Custom Study Decks
    const [customDecks, setCustomDecks] = useState(() => {
        const saved = localStorage.getItem('frenchApp_decks');
        return saved ? JSON.parse(saved) : [];
    });

    const vocabularyRef = useRef(vocabulary);

    useEffect(() => {
        localStorage.setItem('frenchApp_vocab', JSON.stringify(vocabulary));
        vocabularyRef.current = vocabulary;
    }, [vocabulary]);

    useEffect(() => {
        localStorage.setItem('frenchApp_decks', JSON.stringify(customDecks));
    }, [customDecks]);

    const resetVocabulary = useCallback(() => {
        const reset = INITIAL_VOCABULARY.map(word => ({ ...word, updatedAt: Date.now() }));
        setVocabulary(reset);
        localStorage.setItem('frenchApp_vocab', JSON.stringify(reset));
        setCustomDecks([]);
        localStorage.setItem('frenchApp_decks', JSON.stringify([]));
        audioCacheRef.current = {};
    }, []);

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
                reviewHistory: [historyEntry, ...(word.reviewHistory || [])].slice(0, 50),
                snoozeUntil: passed ? null : word.snoozeUntil,
                updatedAt: reviewedAt
            };
        }));

        if (passed) {
            addXP(10);
        }
    }, [addXP]);

    const toggleSaveWord = useCallback((wordId) => {
        setVocabulary(prev => prev.map(word => {
            if (word.id !== wordId) return word;
            return { ...word, isSaved: !word.isSaved };
        }));
    }, []);

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

    const preloadAudioForWords = useCallback((words = []) => {
        words.forEach(word => {
            if (!word) return;
            if (!audioCacheRef.current[word.id]) {
                buildAudioElement(word);
            }
        });
    }, []);

    const playWordAudio = useCallback((wordOrId) => {
        if (!isAudioEnabled()) return;

        const word = typeof wordOrId === 'string'
            ? vocabularyRef.current.find(entry => entry.id === wordOrId)
            : wordOrId;

        if (!word) return;

        const cached = audioCacheRef.current[word.id] || buildAudioElement(word);

        if (cached) {
            cached.currentTime = 0;
            cached.play().catch(() => speak(word.french));
            return;
        }

        speak(word.french);
    }, []);

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
        return vocabularyRef.current
            .filter(word => (!word.snoozeUntil || word.snoozeUntil <= now) && word.nextReview <= now)
            .sort((a, b) => computePriority(b) - computePriority(a));
    }, [computePriority]);

    const getPracticeQueue = useCallback((mode = 'default', limit) => {
        return buildPracticeQueue(vocabularyRef.current, mode, limit);
    }, []);

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
        preloadAudioForWords(getDueWords().slice(0, 10));
    }, [getDueWords, preloadAudioForWords]);

    const hydrateVocabulary = useCallback((incomingVocabulary) => {
        if (!incomingVocabulary) return;
        setVocabulary(incomingVocabulary);
    }, []);

    const downloadAudioOnce = useCallback(async () => {
        await cacheVocabularyAudio(vocabulary);
    }, [vocabulary]);

    const addCustomWord = useCallback((newWord) => {
        const wordWithDefaults = {
            ...newWord,
            id: newWord.id || `custom_${Date.now()}`,
            category: newWord.category || 'imported',
            addedAt: Date.now(),
            srs: getInitialState(),
            level: 1,
            nextReview: 0,
            isCustom: true
        };

        const hydrated = hydrateWord(wordWithDefaults);

        setVocabulary(prev => {
            // Check for duplicates based on french text
            const exists = prev.some(w => w.french.toLowerCase() === hydrated.french.toLowerCase());
            if (exists) return prev;
            return [...prev, hydrated];
        });

        return hydrated;
    }, []);

    // === CUSTOM DECK MANAGEMENT ===

    const createDeck = useCallback((name, description = '', wordIds = [], color = 'indigo') => {
        const newDeck = {
            id: `deck_${Date.now()}`,
            name,
            description,
            wordIds,
            color,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        setCustomDecks(prev => [...prev, newDeck]);
        return newDeck;
    }, []);

    const updateDeck = useCallback((deckId, updates) => {
        setCustomDecks(prev => prev.map(deck =>
            deck.id === deckId
                ? { ...deck, ...updates, updatedAt: Date.now() }
                : deck
        ));
    }, []);

    const deleteDeck = useCallback((deckId) => {
        setCustomDecks(prev => prev.filter(deck => deck.id !== deckId));
    }, []);

    const getDeckWords = useCallback((deckId) => {
        const deck = customDecks.find(d => d.id === deckId);
        if (!deck) return [];
        return vocabulary.filter(word => deck.wordIds.includes(word.id));
    }, [customDecks, vocabulary]);

    const addWordToDeck = useCallback((deckId, wordId) => {
        setCustomDecks(prev => prev.map(deck => {
            if (deck.id !== deckId) return deck;
            if (deck.wordIds.includes(wordId)) return deck;
            return {
                ...deck,
                wordIds: [...deck.wordIds, wordId],
                updatedAt: Date.now()
            };
        }));
    }, []);

    const removeWordFromDeck = useCallback((deckId, wordId) => {
        setCustomDecks(prev => prev.map(deck => {
            if (deck.id !== deckId) return deck;
            return {
                ...deck,
                wordIds: deck.wordIds.filter(id => id !== wordId),
                updatedAt: Date.now()
            };
        }));
    }, []);

    // Export deck as JSON
    const exportDeck = useCallback((deckId) => {
        const deck = customDecks.find(d => d.id === deckId);
        if (!deck) return null;

        const words = vocabulary.filter(w => deck.wordIds.includes(w.id));
        const exportData = {
            version: 1,
            type: 'french-game-deck',
            exportedAt: new Date().toISOString(),
            deck: {
                name: deck.name,
                description: deck.description,
                color: deck.color,
                words: words.map(w => ({
                    french: w.french,
                    english: w.english,
                    phonetic: w.phonetic,
                    category: w.category,
                    gender: w.gender,
                    example: w.example
                }))
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${deck.name.replace(/\s+/g, '_').toLowerCase()}_deck.json`;
        a.click();
        URL.revokeObjectURL(url);

        return exportData;
    }, [customDecks, vocabulary]);

    // Import deck from JSON
    const importDeck = useCallback(async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    if (data.type !== 'french-game-deck' || !data.deck) {
                        throw new Error('Invalid deck file format');
                    }

                    const importedWordsIds = [];

                    // Add any new words to vocabulary
                    data.deck.words.forEach(wordData => {
                        const existingWord = vocabulary.find(
                            w => w.french.toLowerCase() === wordData.french.toLowerCase()
                        );

                        if (existingWord) {
                            importedWordsIds.push(existingWord.id);
                        } else {
                            const newWord = addCustomWord(wordData);
                            if (newWord) importedWordsIds.push(newWord.id);
                        }
                    });

                    // Create the deck
                    const newDeck = createDeck(
                        data.deck.name,
                        data.deck.description,
                        importedWordsIds,
                        data.deck.color || 'indigo'
                    );

                    resolve(newDeck);
                } catch (err) {
                    reject(new Error('Failed to parse deck file: ' + err.message));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }, [vocabulary, addCustomWord, createDeck]);

    const contextValue = useMemo(() => ({
        vocabulary,
        updateWordProgress,
        getDueWords,
        getPracticeQueue,
        getWeightedPracticeWords,
        resetVocabulary,
        CATEGORIES,
        getVocabularyByCategory,
        getAllCategories,
        hydrateVocabulary,
        preloadAudioForWords,
        playWordAudio,
        toggleSaveWord,
        addCustomWord,
        markWordSeen,
        togglePinWord,
        snoozeWord,
        clearSnooze,
        downloadAudioOnce,
        // Custom Deck functions
        customDecks,
        createDeck,
        updateDeck,
        deleteDeck,
        getDeckWords,
        addWordToDeck,
        removeWordFromDeck,
        exportDeck,
        importDeck
    }), [
        vocabulary,
        updateWordProgress,
        getDueWords,
        getPracticeQueue,
        getWeightedPracticeWords,
        resetVocabulary,
        hydrateVocabulary,
        preloadAudioForWords,
        playWordAudio,
        toggleSaveWord,
        addCustomWord,
        markWordSeen,
        togglePinWord,
        snoozeWord,
        clearSnooze,
        downloadAudioOnce,
        customDecks,
        createDeck,
        updateDeck,
        deleteDeck,
        getDeckWords,
        addWordToDeck,
        removeWordFromDeck,
        exportDeck,
        importDeck
    ]);

    return (
        <VocabularyContext.Provider value={contextValue}>
            {children}
        </VocabularyContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useVocabulary = () => useContext(VocabularyContext);
