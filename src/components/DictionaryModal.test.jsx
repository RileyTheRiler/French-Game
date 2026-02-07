import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DictionaryModal from './DictionaryModal';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';

// Mock contexts
vi.mock('../context/VocabularyContext');
vi.mock('../context/ProgressContext');
vi.mock('../utils/audio');
vi.mock('../data/grammar', () => ({
    GRAMMAR_TIPS: [
        { id: '1', title: 'Tip 1', content: 'Grammar content 1' },
        { id: '2', title: 'Tip 2', content: 'Grammar content 2' }
    ]
}));

describe('DictionaryModal Accessibility', () => {
    const mockOnClose = vi.fn();
    const mockVocabulary = [
        { id: '1', french: 'Bonjour', english: 'Hello', level: 1, isSaved: false, pinned: false },
        { id: '2', french: 'Merci', english: 'Thank you', level: 1, isSaved: true, pinned: false }
    ];

    beforeEach(() => {
        useVocabulary.mockReturnValue({
            vocabulary: mockVocabulary,
            toggleSaveWord: vi.fn(),
            togglePinWord: vi.fn(),
            snoozeWord: vi.fn(),
            clearSnooze: vi.fn()
        });
        useProgress.mockReturnValue({
            offlineAudio: false
        });
    });

    it('renders with correct ARIA roles', () => {
        render(<DictionaryModal onClose={mockOnClose} />);

        // Check Dialog Role
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'dictionary-title');

        // Check Tablist
        const tablist = screen.getByRole('tablist');
        expect(tablist).toBeInTheDocument();

        // Check Tabs
        const tabs = screen.getAllByRole('tab');
        expect(tabs).toHaveLength(3);

        const vocabTab = screen.getByRole('tab', { name: /dictionary/i });
        const savedTab = screen.getByRole('tab', { name: /saved/i });
        const grammarTab = screen.getByRole('tab', { name: /grammar/i });

        expect(vocabTab).toHaveAttribute('aria-selected', 'true');
        expect(savedTab).toHaveAttribute('aria-selected', 'false');
        expect(grammarTab).toHaveAttribute('aria-selected', 'false');

        // Check Tabpanel
        const panel = screen.getByRole('tabpanel');
        expect(panel).toBeInTheDocument();
        expect(panel).toHaveAttribute('aria-labelledby', 'tab-vocab');
    });

    it('updates aria-selected when switching tabs', () => {
        render(<DictionaryModal onClose={mockOnClose} />);

        const savedTab = screen.getByRole('tab', { name: /saved/i });

        fireEvent.click(savedTab);

        expect(savedTab).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tab', { name: /dictionary/i })).toHaveAttribute('aria-selected', 'false');

        const panel = screen.getByRole('tabpanel');
        expect(panel).toHaveAttribute('aria-labelledby', 'tab-saved');
    });

    it('close button has aria-label', () => {
        render(<DictionaryModal onClose={mockOnClose} />);
        const closeButton = screen.getByLabelText('Close dictionary');
        expect(closeButton).toBeInTheDocument();
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('search input has aria-label', () => {
         render(<DictionaryModal onClose={mockOnClose} />);
         const input = screen.getByRole('textbox');
         expect(input).toHaveAttribute('aria-label', 'Search dictionary');

         // Switch tab
         fireEvent.click(screen.getByRole('tab', { name: /grammar/i }));
         expect(input).toHaveAttribute('aria-label', 'Search grammar');
    });
});
