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
    Mic: () => <div data-testid="icon-mic" />,
    Clock: () => <div data-testid="icon-clock" />,
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    User: () => <div data-testid="icon-user" />,
    GraduationCap: () => <div data-testid="icon-graduation-cap" />,
    Rocket: () => <div data-testid="icon-rocket" />,
    Crown: () => <div data-testid="icon-crown" />,
}));

vi.mock('../ui/DifficultyDial', () => ({
    getDifficultyConfig: () => ({ showInitial: true })
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
    recordCategoryPerformance: vi.fn(),
    setModeDifficulty: vi.fn(),
    addXP: vi.fn(),
    addCoins: vi.fn(),
    updateDailyStat: vi.fn(),
    incrementStat: vi.fn(),
    offlineAudio: false,
    globalDifficulty: 50,
    difficultySettings: {
        globalMultiplier: 1.0,
        showHints: false,
        fallingWords: 3
    },
    stats: {
        difficultySettings: { fallingWords: 3 },
        weakWords: {}
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
        // Mock requestAnimationFrame
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(() => cb(performance.now()), 16));
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => clearTimeout(id));

        mockVocabulary.getPracticeQueue.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', translation: 'Cat' }
        ]);
        mockVocabulary.getWeightedPracticeWords.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', translation: 'Cat' }
        ]);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders game title and initial state', () => {
        renderWithContext(<FallingWordsGame />);

        expect(screen.getByText('Falling Words')).toBeInTheDocument();
        const scoreElements = screen.getAllByText('0');
        expect(scoreElements.length).toBeGreaterThan(0);
    });

    it.skip('spawns words and handles correct input', async () => {
        renderWithContext(<FallingWordsGame />);

        // Fast forward time to spawn a word
        await act(async () => {
            vi.advanceTimersByTime(3000);
        });

        // Check if word translation is on screen (game shows English translation as falling item)
        // The code says: text={word.translation}
        // So we expect "Cat" to be on screen.
        expect(await screen.findByText('Cat')).toBeInTheDocument();

        // Type the correct answer "Chat"
        const input = screen.getByPlaceholderText(/Type the French translation/i);
        fireEvent.change(input, { target: { value: 'Chat' } });

        // Score should update
        // We expect some score higher than 0
        // Wait for potential async updates
        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        // Input should clear on correct match
        expect(input.value).toBe('');
    });

    it('shows timer in default mode', () => {
        renderWithContext(<FallingWordsGame />);
        // 90 seconds = 1:30
        expect(screen.getByText('1:30')).toBeInTheDocument();
    });

    it.skip('ends game when time runs out', async () => {
        renderWithContext(<FallingWordsGame />);

        // Advance past 90 seconds
        await act(async () => {
            vi.advanceTimersByTime(91000);
        });

        expect(await screen.findByText("Time's Up!")).toBeInTheDocument();
    });
});
