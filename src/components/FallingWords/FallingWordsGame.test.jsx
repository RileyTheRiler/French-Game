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
    Clock: () => <div data-testid="icon-clock" />,
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    Mic: () => <div data-testid="icon-mic" />,
    Globe: () => <div data-testid="icon-globe" />,
    User: () => <div data-testid="icon-user" />,
    GraduationCap: () => <div data-testid="icon-graduation-cap" />,
    Rocket: () => <div data-testid="icon-rocket" />,
    Crown: () => <div data-testid="icon-crown" />,
    Trophy: () => <div data-testid="icon-trophy" />,
}));

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: {
            changeLanguage: () => new Promise(() => {}),
        },
    }),
}));

const mockVocabulary = {
    getDueWords: vi.fn(),
    updateWordProgress: vi.fn(),
    getWeightedPracticeWords: vi.fn(),
    vocabulary: [
        { id: '1', french: 'Chat', english: 'Cat' },
        { id: '2', french: 'Chien', english: 'Dog' }
    ],
    getPracticeQueue: vi.fn(),
    markWordSeen: vi.fn(),
    CATEGORIES: {}
};

const mockProgress = {
    logWordAttempt: vi.fn(),
    recordCategoryPerformance: vi.fn(),
    addXP: vi.fn(),
    addCoins: vi.fn(),
    updateDailyStat: vi.fn(),
    incrementStat: vi.fn(),
    setModeDifficulty: vi.fn(),
    difficultySettings: {
        globalMultiplier: 1.0,
        showHints: false,
        fallingWords: 3
    },
    stats: {
        difficultySettings: { fallingWords: 3 },
        categoryPerformance: {}
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

        // Mock RAF and performance.now
        let currentTime = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => currentTime);
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            return setTimeout(() => {
                currentTime += 16;
                cb(currentTime);
            }, 16);
        });
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => clearTimeout(id));

        // Mock getPracticeQueue to return something
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
        // Check for score (might be 0)
        const scoreElements = screen.getAllByText('0');
        expect(scoreElements.length).toBeGreaterThan(0);
    });

    it.skip('spawns words and handles correct input', async () => {
        // Need to ensure words are available
        mockVocabulary.getPracticeQueue.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', translation: 'Cat' }
        ]);

        renderWithContext(<FallingWordsGame />);

        // Fast forward time to spawn a word
        await act(async () => {
            vi.advanceTimersByTime(3000);
        });

        // Check if word translation is on screen
        // Using findByText with strict: false or query
        const wordElement = await screen.findByText('Cat');
        expect(wordElement).toBeInTheDocument();

        // Type the correct answer "Chat"
        const input = screen.getByPlaceholderText(/Type the French translation/i);
        fireEvent.change(input, { target: { value: 'Chat' } });

        // Score should update
        // We can check if score is not 0 anymore, or if input cleared
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
            vi.advanceTimersByTime(95000);
        });

        expect(await screen.findByText("Time's Up!")).toBeInTheDocument();
    });
});
