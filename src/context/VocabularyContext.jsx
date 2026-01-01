import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProgress } from './ProgressContext';

const VocabularyContext = createContext();

const INITIAL_VOCABULARY = [
    { id: 'v1', french: 'le chat', english: 'the cat', level: 1, nextReview: 0 },
    { id: 'v2', french: 'le chien', english: 'the dog', level: 1, nextReview: 0 },
    { id: 'v3', french: 'la maison', english: 'the house', level: 1, nextReview: 0 },
    { id: 'v4', french: 'la voiture', english: 'the car', level: 1, nextReview: 0 },
    { id: 'v5', french: 'bonjour', english: 'hello', level: 1, nextReview: 0 },
    { id: 'v6', french: 'merci', english: 'thank you', level: 1, nextReview: 0 },
    { id: 'v7', french: 'au revoir', english: 'goodbye', level: 1, nextReview: 0 },
    { id: 'v8', french: 's\'il vous plaît', english: 'please', level: 1, nextReview: 0 },
    { id: 'v9', french: 'pomme', english: 'apple', level: 1, nextReview: 0 },
    { id: 'v10', french: 'pain', english: 'bread', level: 1, nextReview: 0 },
    // Colors
    { id: 'c1', french: 'rouge', english: 'red', level: 1, nextReview: 0 },
    { id: 'c2', french: 'bleu', english: 'blue', level: 1, nextReview: 0 },
    { id: 'c3', french: 'vert', english: 'green', level: 1, nextReview: 0 },
    { id: 'c4', french: 'jaune', english: 'yellow', level: 1, nextReview: 0 },
    { id: 'c5', french: 'noir', english: 'black', level: 1, nextReview: 0 },
    { id: 'c6', french: 'blanc', english: 'white', level: 1, nextReview: 0 },
    // Numbers
    { id: 'n1', french: 'un', english: 'one', level: 1, nextReview: 0 },
    { id: 'n2', french: 'deux', english: 'two', level: 1, nextReview: 0 },
    { id: 'n3', french: 'trois', english: 'three', level: 1, nextReview: 0 },
    { id: 'n4', french: 'quatre', english: 'four', level: 1, nextReview: 0 },
    { id: 'n5', french: 'cinq', english: 'five', level: 1, nextReview: 0 },
    // Common Verbs
    { id: 'vb1', french: 'manger', english: 'to eat', level: 1, nextReview: 0 },
    { id: 'vb2', french: 'boire', english: 'to drink', level: 1, nextReview: 0 },
    { id: 'vb3', french: 'aller', english: 'to go', level: 1, nextReview: 0 },
    { id: 'vb4', french: 'parler', english: 'to speak', level: 1, nextReview: 0 },
];

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
        <VocabularyContext.Provider value={{ vocabulary, updateWordProgress, getDueWords, resetVocabulary }}>
            {children}
        </VocabularyContext.Provider>
    );
};

export const useVocabulary = () => useContext(VocabularyContext);
