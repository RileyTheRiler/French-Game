import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import DictionaryModal from './DictionaryModal';
import { VocabularyContext } from '../context/VocabularyContext';
import { ProgressContext } from '../context/ProgressContext';

// Mock audio utils
vi.mock('../utils/audio', () => ({
    playWordAudio: vi.fn(),
}));

// Mock lucide icons
vi.mock('lucide-react', () => ({
    Volume2: () => <span data-testid="volume-icon" />,
    Star: () => <span data-testid="star-icon" />,
    Pin: () => <span data-testid="pin-icon" />,
    Clock3: () => <span data-testid="clock-icon" />,
    BellOff: () => <span data-testid="bell-icon" />,
}));

const mockVocabulary = [
    {
        id: '1',
        french: 'Bonjour',
        english: 'Hello',
        category: 'basics',
        level: 1,
        isSaved: false,
        pinned: false,
        snoozeUntil: null,
        lastSeen: Date.now() - 10000,
    },
    {
        id: '2',
        french: 'Chat',
        english: 'Cat',
        category: 'animals',
        level: 2,
        isSaved: true,
        pinned: true,
        snoozeUntil: null,
        lastSeen: Date.now() - 100000,
    },
];

const mockContextValue = {
    vocabulary: mockVocabulary,
    toggleSaveWord: vi.fn(),
    togglePinWord: vi.fn(),
    snoozeWord: vi.fn(),
    clearSnooze: vi.fn(),
};

const mockProgressValue = {
    offlineAudio: false,
};

const renderWithContext = (ui, { vocabProps = {}, progressProps = {} } = {}) => {
    return render(
        <ProgressContext.Provider value={{ ...mockProgressValue, ...progressProps }}>
            <VocabularyContext.Provider value={{ ...mockContextValue, ...vocabProps }}>
                {ui}
            </VocabularyContext.Provider>
        </ProgressContext.Provider>
    );
};

describe('DictionaryModal', () => {
    it('renders vocabulary list', () => {
        renderWithContext(<DictionaryModal onClose={vi.fn()} />);
        expect(screen.getByText('Bonjour')).toBeInTheDocument();
        expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    it('filters vocabulary based on search term', () => {
        renderWithContext(<DictionaryModal onClose={vi.fn()} />);
        const input = screen.getByPlaceholderText(/Search dictionary/i);
        fireEvent.change(input, { target: { value: 'Bon' } });

        expect(screen.getByText('Bonjour')).toBeInTheDocument();
        expect(screen.queryByText('Chat')).not.toBeInTheDocument();
    });

    it('switches to saved tab', () => {
        renderWithContext(<DictionaryModal onClose={vi.fn()} />);
        const savedTab = screen.getByText('Saved');
        fireEvent.click(savedTab);

        expect(screen.queryByText('Bonjour')).not.toBeInTheDocument(); // Not saved
        expect(screen.getByText('Chat')).toBeInTheDocument(); // Saved
    });

    it('toggles save word', async () => {
        const user = userEvent.setup();
        renderWithContext(<DictionaryModal onClose={vi.fn()} />);

        // Bonjour is NOT saved, so aria-label should be "Save"
        const saveButton = screen.getByRole('button', { name: 'Save' });
        await user.click(saveButton);

        expect(mockContextValue.toggleSaveWord).toHaveBeenCalledWith('1');
    });
});
