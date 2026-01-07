import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { VocabularyProvider, useVocabulary } from './VocabularyContext';
import { ProgressContext } from './ProgressContext';

// Mock ProgressContext
const mockAddXP = vi.fn();
const mockProgress = {
    addXP: mockAddXP,
};

const wrapper = ({ children }) => (
    <ProgressContext.Provider value={mockProgress}>
        <VocabularyProvider>{children}</VocabularyProvider>
    </ProgressContext.Provider>
);

describe('VocabularyContext', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes with default vocabulary', () => {
        const { result } = renderHook(() => useVocabulary(), { wrapper });
        expect(result.current.vocabulary.length).toBeGreaterThan(0);
        expect(result.current.vocabulary[0].srs).toBeDefined();
    });

    it('updateWordProgress updates SRS state correctly', () => {
        const { result } = renderHook(() => useVocabulary(), { wrapper });
        const word = result.current.vocabulary[0];

        act(() => {
            result.current.updateWordProgress(word.id, 'easy');
        });

        const updatedWord = result.current.vocabulary.find(w => w.id === word.id);
        expect(updatedWord.srs.repetition).toBeGreaterThan(0);
        expect(updatedWord.level).toBeGreaterThanOrEqual(1);
        expect(mockAddXP).toHaveBeenCalled();
    });

    it('toggles save word', () => {
        const { result } = renderHook(() => useVocabulary(), { wrapper });
        const word = result.current.vocabulary[0];

        act(() => {
            result.current.toggleSaveWord(word.id);
        });

        expect(result.current.vocabulary.find(w => w.id === word.id).isSaved).toBe(true);

        act(() => {
            result.current.toggleSaveWord(word.id);
        });

        expect(result.current.vocabulary.find(w => w.id === word.id).isSaved).toBe(false);
    });

    it('custom deck operations work', () => {
        const { result } = renderHook(() => useVocabulary(), { wrapper });

        let deck;
        act(() => {
            deck = result.current.createDeck('My Deck');
        });

        expect(result.current.customDecks).toHaveLength(1);
        expect(result.current.customDecks[0].name).toBe('My Deck');

        act(() => {
            result.current.deleteDeck(deck.id);
        });

        expect(result.current.customDecks).toHaveLength(0);
    });
});
