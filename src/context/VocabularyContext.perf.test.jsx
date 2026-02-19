import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React, { useEffect } from 'react';
import { VocabularyProvider, useVocabulary } from './VocabularyContext';

// Mock localStorage to avoid QuotaExceededError
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
    },
    writable: true
});

// Mock ProgressContext
vi.mock('./ProgressContext', async () => {
    const actual = await vi.importActual('./ProgressContext');
    return {
        ...actual,
        useProgress: () => ({
            addXP: vi.fn(),
        }),
        ProgressProvider: ({ children }) => <div>{children}</div>
    };
});

// Mock Data
vi.mock('../data/vocabulary', () => ({
    vocabularyList: Array.from({ length: 5000 }, (_, i) => ({
        id: `bench_${i}`,
        french: `mot_${i}`,
        english: `word_${i}`,
        category: 'basics',
        srs: { dueDate: Date.now() - 100000, repetition: 1, interval: 1, ef: 2.5 },
        // Create a history that requires iteration
        reviewHistory: Array.from({ length: 50 }, (_, j) => ({
            timestamp: Date.now() - j * 86400000,
            correct: j % 2 === 0,
            grade: 3
        }))
    })),
    CATEGORIES: { BASICS: 'Basics' },
    getVocabularyByCategory: () => [],
    getAllCategories: () => []
}));

vi.mock('../utils/audio', () => ({
    speak: vi.fn(),
    cacheVocabularyAudio: vi.fn()
}));

describe('VocabularyContext Performance Benchmark', () => {
    it('should measure getDueWords execution time', async () => {
        let measureTime = 0;

        const TestComponent = () => {
            const { getDueWords } = useVocabulary();

            useEffect(() => {
                const start = performance.now();
                // Call getDueWords multiple times to amplify the difference
                // 100 iterations on 5000 items = 500,000 sort operations roughly
                for (let i = 0; i < 50; i++) {
                    getDueWords();
                }
                const end = performance.now();
                measureTime = end - start;
            }, [getDueWords]);

            return null;
        };

        render(
            <VocabularyProvider>
                <TestComponent />
            </VocabularyProvider>
        );

        // Ensure effect ran
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        console.log(`Execution time for 50 calls: ${measureTime.toFixed(2)}ms`);
        expect(measureTime).toBeGreaterThan(0);
    });
});
