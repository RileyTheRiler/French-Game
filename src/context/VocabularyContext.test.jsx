import { render, act, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React, { useState, useEffect } from 'react';
import { VocabularyProvider, useVocabulary } from './VocabularyContext';
import { ProgressProvider } from './ProgressContext';

// Mock ProgressContext to avoid complex dependencies
const mockAddXP = vi.fn();
vi.mock('./ProgressContext', async () => {
    const actual = await vi.importActual('./ProgressContext');
    return {
        ...actual,
        useProgress: () => ({
            addXP: mockAddXP,
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
        expect(renderSpy).toHaveBeenCalledTimes(1);

        act(() => {
            addWordFn({ french: 'Chien', english: 'Dog' });
        });

        // Should re-render because state changed
        expect(renderSpy).toHaveBeenCalledTimes(2);
        expect(screen.getByText('Vocabulary Size: 3')).toBeInTheDocument();
    });
});
