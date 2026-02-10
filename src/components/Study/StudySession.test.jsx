import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StudySession from './StudySession';
import { VocabularyContext } from '../../context/VocabularyContext';
import { ProgressContext } from '../../context/ProgressContext';
import { ToastContext } from '../../context/ToastContext';
import { MemoryRouter } from 'react-router-dom';

// Mocks
vi.mock('../../utils/SoundManager', () => ({
    default: {
        playFlip: vi.fn(),
        playSuccess: vi.fn(),
        playFailure: vi.fn(),
    },
}));

vi.mock('../../utils/InteractionEffects', () => ({
    triggerShake: vi.fn(),
    triggerConfetti: vi.fn(),
}));

vi.mock('lucide-react', () => ({
    ArrowLeft: () => <div data-testid="icon-arrow-left" />,
    Settings: () => <div data-testid="icon-settings" />,
    Volume2: () => <div data-testid="icon-volume" />,
    RotateCw: () => <div data-testid="icon-rotate" />,
    Check: () => <div data-testid="icon-check" />,
    X: () => <div data-testid="icon-x" />,
    Ghost: () => <div data-testid="icon-ghost" />,
}));

const mockVocabulary = {
    getDueWords: vi.fn(),
    updateWordProgress: vi.fn(),
    vocabulary: [
        { id: '1', french: 'Bonjour', english: 'Hello', cefr: 'A1', category: 'Greetings' },
        { id: '2', french: 'Chat', english: 'Cat', cefr: 'A1', category: 'Animals' }
    ],
    playWordAudio: vi.fn(),
    preloadAudioForWords: vi.fn(),
    markWordSeen: vi.fn(),
    CATEGORIES: { 'Greetings': { name: 'Greetings' }, 'Animals': { name: 'Animals' } }
};

const mockProgress = {
    addXP: vi.fn(),
    addCoins: vi.fn(),
    updateDailyStat: vi.fn(),
    incrementStat: vi.fn(),
    offlineAudio: false
};

const mockToast = {
    showToast: vi.fn(),
    showSuccess: vi.fn()
};

const renderWithContext = (ui) => {
    return render(
        <ProgressContext.Provider value={mockProgress}>
            <VocabularyContext.Provider value={mockVocabulary}>
                <ToastContext.Provider value={mockToast}>
                    <MemoryRouter>
                        {ui}
                    </MemoryRouter>
                </ToastContext.Provider>
            </VocabularyContext.Provider>
        </ProgressContext.Provider>
    );
};

describe('StudySession', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders empty state when no due words', () => {
        mockVocabulary.getDueWords.mockReturnValue([]);
        renderWithContext(<StudySession />);

        expect(screen.getByText(/All Caught Up!/i)).toBeInTheDocument();
    });

    it('renders flashcard when there are due words', () => {
        mockVocabulary.getDueWords.mockReturnValue([
            { id: '1', french: 'Bonjour', english: 'Hello', cefr: 'A1' }
        ]);
        renderWithContext(<StudySession />);

        expect(screen.getByText('Bonjour')).toBeInTheDocument();
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('French')).toBeInTheDocument();
    });

    it('flips card on click and shows controls', () => {
        mockVocabulary.getDueWords.mockReturnValue([
            { id: '1', french: 'Bonjour', english: 'Hello', cefr: 'A1' }
        ]);
        renderWithContext(<StudySession />);

        const card = screen.getByRole('button', { name: /Reveal translation/i });
        fireEvent.click(card);

        // Check if controls appear
        expect(screen.getByText('Good')).toBeInTheDocument();
        expect(screen.getByText('Again')).toBeInTheDocument();
    });

    it('handles grading and moves to next card', () => {
        mockVocabulary.getDueWords.mockReturnValue([
            { id: '1', french: 'Bonjour', english: 'Hello', cefr: 'A1' },
            { id: '2', french: 'Chat', english: 'Cat', cefr: 'A1' }
        ]);
        renderWithContext(<StudySession />);

        // Flip
        const card = screen.getByRole('button', { name: /Reveal translation/i });
        fireEvent.click(card);

        // Grade Good
        const goodButton = screen.getByText('Good');
        fireEvent.click(goodButton);

        expect(mockVocabulary.updateWordProgress).toHaveBeenCalledWith('1', 'good');

        // Should show next card
        expect(screen.getByText('Chat')).toBeInTheDocument();
    });
});
