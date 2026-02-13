import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FallingWordsGame from './FallingWordsGame';
import { VocabularyContext } from '../../context/VocabularyContext';
import { ProgressContext } from '../../context/ProgressContext';
import { MemoryRouter } from 'react-router-dom';

// Mocks
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
    markWordSeen: vi.fn(),
    getPracticeQueue: vi.fn(),
    vocabulary: [
        { id: '1', french: 'Chat', english: 'Cat' },
        { id: '2', french: 'Chien', english: 'Dog' }
    ]
};

const mockProgress = {
    logWordAttempt: vi.fn(),
    recordCategoryPerformance: vi.fn(),
    setModeDifficulty: vi.fn(),
    addXP: vi.fn(),
    addCoins: vi.fn(),
    updateDailyStat: vi.fn(),
    incrementStat: vi.fn(),
    difficultySettings: {
        globalMultiplier: 1.0,
        showHints: false,
        fallingWords: 3
    },
    globalDifficulty: 25,
    stats: {
        difficultySettings: {
            fallingWords: 3
        }
    },
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
    let now;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();

        now = 1000;
        vi.spyOn(performance, 'now').mockImplementation(() => now);

        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            return setTimeout(() => {
                now += 16;
                cb(now);
            }, 16);
        });

        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => clearTimeout(id));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders game title and initial state', () => {
        mockVocabulary.getDueWords.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', category: 'animals' }
        ]);
        renderWithContext(<FallingWordsGame />);

        expect(screen.getByText('Falling Words')).toBeInTheDocument();
        // There might be multiple '0's (Score, and hidden score)
        const zeros = screen.getAllByText('0');
        expect(zeros.length).toBeGreaterThan(0);
    });

    it('spawns words and handles correct input', async () => {
        mockVocabulary.getDueWords.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', translation: 'Cat', category: 'animals' }
        ]);

        renderWithContext(<FallingWordsGame />);

        // Fast forward time to spawn a word
        act(() => {
            vi.advanceTimersByTime(3000);
        });

        // Check if word translation is on screen
        expect(await screen.findByText('Cat')).toBeInTheDocument();

        // Type the correct answer "Chat"
        const input = screen.getByPlaceholderText(/Type the French translation/i);
        fireEvent.change(input, { target: { value: 'Chat' } });

        // Wait for input to clear (which happens on match)
        expect(input.value).toBe('');
    });

    it('shows timer in default mode', () => {
        renderWithContext(<FallingWordsGame />);
        // 90 seconds = 1:30
        expect(screen.getByText('1:30')).toBeInTheDocument();
    });

    it('ends game when time runs out', async () => {
        renderWithContext(<FallingWordsGame />);

        // Advance past 90 seconds
        act(() => {
            vi.advanceTimersByTime(95000);
        });

        expect(await screen.findByText("Time's Up!")).toBeInTheDocument();
    });
});
