import { render, act, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React, { useState, useEffect } from 'react';
import { VocabularyProvider, useVocabulary } from './VocabularyContext';
import { ProgressProvider } from './ProgressContext';

// Mock ProgressContext to avoid complex dependencies
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
    vocabularyList: [
        { id: '1', french: 'Bonjour', english: 'Hello' },
        { id: '2', french: 'Chat', english: 'Cat' }
    ],
    CATEGORIES: { BASICS: 'Basics' },
    getVocabularyByCategory: () => [],
    getAllCategories: () => []
}));

vi.mock('../utils/audio', () => ({
    speak: vi.fn(),
    cacheVocabularyAudio: vi.fn()
}));

const TestConsumer = React.memo(({ onRender }) => {
    const { vocabulary } = useVocabulary();
    onRender();
    return <div>Vocabulary Size: {vocabulary.length}</div>;
});

describe('VocabularyContext Performance', () => {
    it('should memoize context value and prevent unnecessary re-renders', () => {
        const renderSpy = vi.fn();

        const App = () => {
            const [count, setCount] = useState(0);
            return (
                <VocabularyProvider>
                    <button onClick={() => setCount(c => c + 1)}>Force Render {count}</button>
                    <TestConsumer onRender={renderSpy} />
                </VocabularyProvider>
            );
        };

        render(<App />);

        // Initial render
        expect(renderSpy).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Vocabulary Size: 2')).toBeInTheDocument();

        // Force parent re-render
        act(() => {
            screen.getByText(/Force Render/).click();
        });

        // The Provider re-renders, but because of useMemo in Provider AND React.memo in Consumer,
        // the consumer should NOT re-render.
        // NOTE: In Strict Mode (which might be enabled in tests implicitly or via setup), components render twice.
        // If renderSpy is called twice initially, we might need to adjust expectation or understand the test environment.
        // Assuming standard behavior for now, if it fails with 2 calls, it might be the initial mount + effect or strict mode.
        // However, the previous failure was "expected 1 times, but got 2 times" after the update or initial?
        // Ah, the failure was likely on the re-render check.
        // If the context value is NOT stable, TestConsumer (which uses the context) will re-render when Provider re-renders.
        // Since we are mocking ProgressContext properly now, let's see.

        // If it still fails, we might need to relax the check or ensure VocabularyContext is actually memoizing properly.
        // For now, I'll keep it as 1 to see if my ProgressContext mock fix helped (avoiding circular dependency issues).
        expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should update consumers when vocabulary changes', () => {
        const renderSpy = vi.fn();
        let addWordFn;

        const App = () => {
            return (
                <VocabularyProvider>
                    <ConsumerExposer getAddWord={(fn) => addWordFn = fn} />
                    <TestConsumer onRender={renderSpy} />
                </VocabularyProvider>
            );
        };

        const ConsumerExposer = ({ getAddWord }) => {
            const { addCustomWord } = useVocabulary();
            useEffect(() => {
                getAddWord(addCustomWord);
            }, [addCustomWord, getAddWord]);
            return null;
        };

        render(<App />);
        // Initial render
        expect(renderSpy).toHaveBeenCalledTimes(1);

        act(() => {
            addWordFn({ french: 'Chien', english: 'Dog' });
        });

        // Should re-render because state changed
        expect(renderSpy).toHaveBeenCalledTimes(2);
        expect(screen.getByText('Vocabulary Size: 3')).toBeInTheDocument();
    });
});
