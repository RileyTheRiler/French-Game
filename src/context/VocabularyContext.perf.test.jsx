import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { VocabularyProvider, useVocabulary } from './VocabularyContext';

// Mock dependencies
vi.mock('./ProgressContext', () => ({
    useProgress: () => ({ addXP: vi.fn() }),
    ProgressProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('../utils/audio', () => ({
    speak: vi.fn(),
    cacheVocabularyAudio: vi.fn()
}));

vi.mock('../utils/practiceQueue', () => ({
    buildPracticeQueue: vi.fn(() => [])
}));

vi.mock('../data/vocabulary', () => {
    const mockVocabulary = Array.from({ length: 10 }, (_, i) => ({
        id: `word_${i}`,
        french: `Word ${i}`,
        english: `Word ${i}`,
        srs: { dueDate: Date.now() - 1000 * i, repetition: i },
        reviewHistory: []
    }));
    return {
        vocabularyList: mockVocabulary,
        CATEGORIES: {},
        getVocabularyByCategory: () => [],
        getAllCategories: () => []
    };
});

describe('VocabularyContext Performance', () => {
    let dateNowSpy;

    beforeEach(() => {
        dateNowSpy = vi.spyOn(Date, 'now');
        localStorage.clear();
    });

    afterEach(() => {
        dateNowSpy.mockRestore();
        vi.clearAllMocks();
    });

    it('getDueWords calls Date.now() exactly once (optimized)', () => {
        const { result } = renderHook(() => useVocabulary(), {
            wrapper: VocabularyProvider
        });

        dateNowSpy.mockClear();

        let words;
        act(() => {
            words = result.current.getDueWords();
        });

        // Should be exactly 1 call
        expect(dateNowSpy).toHaveBeenCalledTimes(1);
        expect(words.length).toBeGreaterThan(0);
    });
});
