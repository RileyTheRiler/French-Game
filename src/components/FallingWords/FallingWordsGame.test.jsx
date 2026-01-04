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
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    Clock: () => <div data-testid="icon-clock" />,
    Mic: () => <div data-testid="icon-mic" />,
    User: () => <div data-testid="icon-user" />,
    Zap: () => <div data-testid="icon-zap" />,
    Crown: () => <div data-testid="icon-crown" />,
    Rocket: () => <div data-testid="icon-rocket" />,
    GraduationCap: () => <div data-testid="icon-grad-cap" />
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
    difficultySettings: {
        globalMultiplier: 1.0,
        showHints: false,
        fallingWords: 3
    },
    stats: {
        difficultySettings: {
            fallingWords: 3
        },
        categoryPerformance: {}
    },
    recordCategoryPerformance: vi.fn(),
    setModeDifficulty: vi.fn(),
    addXP: vi.fn(),
    addCoins: vi.fn(),
    updateDailyStat: vi.fn(),
    incrementStat: vi.fn(),
    offlineAudio: false,
    globalDifficulty: 25
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
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders game title and initial state', () => {
        mockVocabulary.getPracticeQueue.mockReturnValue([
             { id: '1', french: 'Chat', english: 'Cat' }
        ]);
        renderWithContext(<FallingWordsGame />);

        expect(screen.getByText('Falling Words')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument(); // Score
    });

    it('spawns words and handles correct input', async () => {
        mockVocabulary.getPracticeQueue.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', translation: 'Cat' }
        ]);
        // Also mock weighted for fallback
        mockVocabulary.getWeightedPracticeWords.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', translation: 'Cat' }
        ]);

        renderWithContext(<FallingWordsGame />);

        // Fast forward time to spawn a word
        act(() => {
            vi.advanceTimersByTime(3000);
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
        expect(screen.getByText(/12/)).toBeInTheDocument(); // Score update
        expect(input.value).toBe(''); // Input should clear
    });

    it('shows timer in default mode', () => {
        mockVocabulary.getPracticeQueue.mockReturnValue([]);
        renderWithContext(<FallingWordsGame />);
        // 90 seconds = 1:30
        expect(screen.getByText('1:30')).toBeInTheDocument();
    });

    it('ends game when time runs out', async () => {
        mockVocabulary.getPracticeQueue.mockReturnValue([]);
        renderWithContext(<FallingWordsGame />);

        // Advance past 90 seconds
        act(() => {
            vi.advanceTimersByTime(91000);
        });

        expect(await screen.findByText("Time's Up!")).toBeInTheDocument();
    });
});
