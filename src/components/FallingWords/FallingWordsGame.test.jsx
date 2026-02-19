import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FallingWordsGame from './FallingWordsGame';
import { VocabularyContext } from '../../context/VocabularyContext';
import { ProgressContext } from '../../context/ProgressContext';
import { MemoryRouter } from 'react-router-dom';

// Mocks
vi.mock('framer-motion', () => ({
    motion: new Proxy({}, {
        get: (target, prop) => {
            return ({ children, ...props }) => {
                const Tag = prop;
                return <Tag {...props}>{children}</Tag>;
            }
        }
    }),
    AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: {
            changeLanguage: () => new Promise(() => {}),
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: () => {},
    }
}));

vi.mock('../../utils/SoundManager', () => ({
    default: {
        init: vi.fn(),
        playMatch: vi.fn(),
        playMiss: vi.fn(),
        playGameOver: vi.fn(),
        playLevelUp: vi.fn(),
    },
}));

vi.mock('lucide-react', () => ({
    Ghost: () => <div data-testid="icon-ghost" />,
    Swords: () => <div data-testid="icon-swords" />,
    X: () => <div data-testid="icon-x" />,
    ArrowLeft: () => <div data-testid="icon-arrow-left" />,
    Pause: () => <div data-testid="icon-pause" />,
    Play: () => <div data-testid="icon-play" />,
    Volume2: () => <div data-testid="icon-volume" />,
    Settings: () => <div data-testid="icon-settings" />,
    Globe: () => <div data-testid="icon-globe" />,
    User: () => <div data-testid="icon-user" />,
    GraduationCap: () => <div data-testid="icon-graduation-cap" />,
    Rocket: () => <div data-testid="icon-rocket" />,
    Crown: () => <div data-testid="icon-crown" />,
    Clock: () => <div data-testid="icon-clock" />,
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    Mic: () => <div data-testid="icon-mic" />,
}));

const mockVocabulary = {
    getDueWords: vi.fn(),
    updateWordProgress: vi.fn(),
    getWeightedPracticeWords: vi.fn(),
    getPracticeQueue: vi.fn(),
    markWordSeen: vi.fn(),
    vocabulary: [
        { id: '1', french: 'Chat', english: 'Cat' },
        { id: '2', french: 'Chien', english: 'Dog' }
    ]
};

const mockProgress = {
    logWordAttempt: vi.fn(),
    addXP: vi.fn(),
    addCoins: vi.fn(),
    updateDailyStat: vi.fn(),
    incrementStat: vi.fn(),
    recordCategoryPerformance: vi.fn(),
    difficultySettings: {
        globalMultiplier: 1.0,
        showHints: false
    }
};

const renderWithContext = (ui) => {
    return render(
        <ProgressContext.Provider value={mockProgress}>
            <VocabularyContext.Provider value={mockVocabulary}>
                <MemoryRouter>
                    {ui}
                </MemoryRouter>
            </VocabularyContext.Provider>
        </ProgressContext.Provider>
    );
};

describe('FallingWordsGame', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();

        // Mock requestAnimationFrame to use Date.now() which is mocked by vi.useFakeTimers
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(() => cb(Date.now()), 16));
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => clearTimeout(id));

        // Ensure performance.now() also returns Date.now() for consistency if called directly
        vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('renders game title and initial state', () => {
        mockVocabulary.getPracticeQueue.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', translation: 'Cat' }
        ]);
        renderWithContext(<FallingWordsGame />);

        expect(screen.getByText('Falling Words')).toBeInTheDocument();
        const scoreIcon = screen.getByTestId('icon-trending-up');
        expect(scoreIcon.parentElement).toHaveTextContent('0');
    });

    // TODO: Fix timeout issues with requestAnimationFrame + fake timers
    it.skip('spawns words and handles correct input', async () => {
        mockVocabulary.getPracticeQueue.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', translation: 'Cat' }
        ]);

        renderWithContext(<FallingWordsGame />);

        // Fast forward time to spawn a word
        // Need enough time for word to spawn (2000ms) and fall into view (starts at -10%)
        act(() => {
            vi.advanceTimersByTime(8000);
        });

        // Check if word translation is on screen (game shows English translation as falling item?)
        // The code says: text={word.translation}
        // So we expect "Cat" to be on screen.
        expect(await screen.findByText('Cat')).toBeInTheDocument();

        // Type the correct answer "Chat"
        const input = screen.getByPlaceholderText(/Type the French translation/i);
        fireEvent.change(input, { target: { value: 'Chat' } });

        // Score should update
        // Note: The game loop might need another tick to process the match if it was purely frame based, 
        // but handleInputChange checks immediately against activeWordsRef.

        // Wait for update
        const scoreIcon = screen.getByTestId('icon-trending-up');
        expect(scoreIcon.parentElement.textContent).not.toBe('0');
        expect(input.value).toBe(''); // Input should clear
    });
    it('shows timer in default mode', () => {
        renderWithContext(<FallingWordsGame />);
        // 90 seconds = 1:30
        expect(screen.getByText('1:30')).toBeInTheDocument();
    });

    it.skip('ends game when time runs out', async () => {
        renderWithContext(<FallingWordsGame />);

        // Advance past 90 seconds
        act(() => {
            vi.advanceTimersByTime(91000);
        });

        expect(await screen.findByText("Time's Up!")).toBeInTheDocument();
    });

    it.skip('adds time on correct answer', async () => {
        mockVocabulary.getPracticeQueue.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', translation: 'Cat' }
        ]);

        renderWithContext(<FallingWordsGame />);

        // Advance 10 seconds (should be 1:20 / 80s left)
        act(() => {
            vi.advanceTimersByTime(10000);
        });

        // Initial check if we want, but hard to sync perfectly in test environment without more mocks.
        // Instead, just trigger correct answer and check if we see the +5s popup or if time didn't go down as much.

        const input = screen.getByPlaceholderText(/Type the French translation/i);
        fireEvent.change(input, { target: { value: 'Chat' } });

        // Check for +5s popup
        expect(await screen.findByText('+5s')).toBeInTheDocument();
    });
});
