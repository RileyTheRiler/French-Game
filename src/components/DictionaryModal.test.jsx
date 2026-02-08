import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DictionaryModal from './DictionaryModal';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';

// Mock dependencies
vi.mock('../context/VocabularyContext');
vi.mock('../context/ProgressContext');
vi.mock('../utils/audio', () => ({
    playWordAudio: vi.fn()
}));

// Mock Grammar Tips
vi.mock('../data/grammar', () => ({
    GRAMMAR_TIPS: [
        { id: 'g1', title: 'Test Grammar 1', content: 'Content 1' },
        { id: 'g2', title: 'Test Grammar 2', content: 'Content 2' }
    ]
}));

describe('DictionaryModal', () => {
    const mockVocabulary = [
        { id: '1', french: 'Bonjour', english: 'Hello', isSaved: false, pinned: false, level: 1 },
        { id: '2', french: 'Chat', english: 'Cat', isSaved: true, pinned: false, level: 5 }
    ];

    const mockVocabularyFunctions = {
        vocabulary: mockVocabulary,
        toggleSaveWord: vi.fn(),
        togglePinWord: vi.fn(),
        snoozeWord: vi.fn(),
        clearSnooze: vi.fn()
    };

    beforeEach(() => {
        useVocabulary.mockReturnValue(mockVocabularyFunctions);
        useProgress.mockReturnValue({ offlineAudio: false });
        vi.clearAllMocks();
    });

    it('renders vocabulary list by default', () => {
        render(<DictionaryModal onClose={vi.fn()} />);
        expect(screen.getByText('Bonjour')).toBeDefined();
        expect(screen.getByText('Chat')).toBeDefined();
    });

    it('filters vocabulary based on search term', () => {
        render(<DictionaryModal onClose={vi.fn()} />);
        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'Bonjour' } });

        expect(screen.getByText('Bonjour')).toBeDefined();
        expect(screen.queryByText('Chat')).toBeNull();
    });

    it('switches to saved tab', () => {
        render(<DictionaryModal onClose={vi.fn()} />);
        const savedTab = screen.getByText('Saved');
        fireEvent.click(savedTab);

        // Should only show saved words
        expect(screen.queryByText('Bonjour')).toBeNull(); // isSaved: false
        expect(screen.getByText('Chat')).toBeDefined(); // isSaved: true
    });

    it('switches to grammar tab', () => {
        render(<DictionaryModal onClose={vi.fn()} />);
        const grammarTab = screen.getByText('Grammar');
        fireEvent.click(grammarTab);

        expect(screen.getByText('Test Grammar 1')).toBeDefined();
        expect(screen.queryByText('Bonjour')).toBeNull();
    });
});
