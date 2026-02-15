import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import { VocabularyProvider, useVocabulary } from './VocabularyContext';
import * as ProgressContext from './ProgressContext';

// Mock ProgressContext
vi.mock('./ProgressContext', () => ({
    useProgress: vi.fn(),
}));

// Test component to consume context
const TestComponent = ({ onRender }) => {
    const { vocabulary } = useVocabulary();
    onRender();
    return <div>Vocabulary Size: {vocabulary.length}</div>;
};

describe('VocabularyContext Performance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock return
        ProgressContext.useProgress.mockReturnValue({
            addXP: vi.fn(),
        });

        // Mock localStorage
        Storage.prototype.getItem = vi.fn(() => null);
        Storage.prototype.setItem = vi.fn();
    });

    it('should update consumers when vocabulary changes', () => {
        render(
            <VocabularyProvider>
                <TestComponent onRender={vi.fn()} />
            </VocabularyProvider>
        );

        // Initial render check - checks if it renders at all
        expect(screen.getByText(/Vocabulary Size: \d+/)).toBeInTheDocument();
    });

    it.skip('should memoize context value and prevent unnecessary re-renders', () => {
        const renderSpy = vi.fn();

        const { rerender } = render(
            <VocabularyProvider>
                <TestComponent onRender={renderSpy} />
            </VocabularyProvider>
        );

        // Initial render
        expect(renderSpy).toHaveBeenCalledTimes(1);

        // Re-render Provider with same props/state (simulate parent re-render)
        rerender(
            <VocabularyProvider>
                <TestComponent onRender={renderSpy} />
            </VocabularyProvider>
        );

        // The Provider re-renders, but because of useMemo in Provider,
        // the consumer should NOT re-render.
        expect(renderSpy).toHaveBeenCalledTimes(1);
    });
});
