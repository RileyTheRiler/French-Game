import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FallingWordsGame from './FallingWordsGame';
import { VocabularyContext } from '../../context/VocabularyContext';
import { ProgressContext } from '../../context/ProgressContext';
import { MemoryRouter } from 'react-router-dom';

// Mocks
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str) => str,
        i18n: {
            language: 'en',
            changeLanguage: vi.fn(),
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: vi.fn(),
    }
}));

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
        header: ({ children, ...props }) => <header {...props}>{children}</header>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
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
    Clock: () => <div data-testid="icon-clock" />,
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    Mic: () => <div data-testid="icon-mic" />,
    User: () => <div data-testid="icon-user" />,
    GraduationCap: () => <div data-testid="icon-graduation-cap" />,
    Rocket: () => <div data-testid="icon-rocket" />,
    Crown: () => <div data-testid="icon-crown" />,
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
    ],
    CATEGORIES: { BASICS: 'Basics' }
};

const mockProgress = {
    logWordAttempt: vi.fn(),
    addXP: vi.fn(),
    addCoins: vi.fn(),
    updateDailyStat: vi.fn(),
    incrementStat: vi.fn(),
    setModeDifficulty: vi.fn(),
    recordCategoryPerformance: vi.fn(),
    stats: {
        difficultySettings: {
            fallingWords: 3
        }
    },
    difficultySettings: {
        learnerType: 'casual'
    },
    globalDifficulty: 50,
    offlineAudio: false
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
    let currentTime = 0;

    beforeEach(() => {
        currentTime = 0;
        vi.useFakeTimers();
        vi.clearAllMocks();

        // Mock performance.now
        vi.spyOn(performance, 'now').mockImplementation(() => currentTime);

        // Mock requestAnimationFrame
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            return setTimeout(() => {
                currentTime += 16;
                cb(currentTime);
            }, 16);
        });
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => clearTimeout(id));

        // Default returns
        mockVocabulary.getPracticeQueue.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', translation: 'Cat', category: 'Animals' }
        ]);
        mockVocabulary.getWeightedPracticeWords.mockReturnValue([]);
        mockVocabulary.getDueWords.mockReturnValue([]);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders game title and initial state', () => {
        renderWithContext(<FallingWordsGame />);

        expect(screen.getByText('Falling Words')).toBeInTheDocument();
        const scores = screen.getAllByText('0');
        expect(scores.length).toBeGreaterThan(0);
    });

    it.skip('spawns words and handles correct input', async () => {
        renderWithContext(<FallingWordsGame />);

        // Fast forward time to spawn a word
        await act(async () => {
            vi.advanceTimersByTime(4000);
        });

        expect(await screen.findByText('Cat')).toBeInTheDocument();

        // Type the correct answer "Chat"
        const input = screen.getByPlaceholderText(/Type the French translation/i);
        fireEvent.change(input, { target: { value: 'Chat' } });

        // Score should update
        expect(mockVocabulary.updateWordProgress).toHaveBeenCalledWith('1', 'good');
        expect(input.value).toBe(''); // Input should clear
    });

    it('shows timer in default mode', () => {
        renderWithContext(<FallingWordsGame />);
        expect(screen.getByText('1:30')).toBeInTheDocument();
    });

    it.skip('ends game when time runs out', async () => {
        renderWithContext(<FallingWordsGame />);

        await act(async () => {
            vi.advanceTimersByTime(95000);
        });

        expect(await screen.findByText("Time's Up!")).toBeInTheDocument();
    });

    it.skip('adds time on correct answer', async () => {
        renderWithContext(<FallingWordsGame />);

        await act(async () => {
            vi.advanceTimersByTime(10000);
        });

        const input = screen.getByPlaceholderText(/Type the French translation/i);
        fireEvent.change(input, { target: { value: 'Chat' } });

        expect(await screen.findByText('+5s')).toBeInTheDocument();
    });
});
