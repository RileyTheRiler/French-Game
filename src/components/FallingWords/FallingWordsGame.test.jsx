import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import FallingWordsGame from './FallingWordsGame';
import { VocabularyContext } from '../../context/VocabularyContext';
import { ProgressContext } from '../../context/ProgressContext';
import { BrowserRouter } from 'react-router-dom';

// Hoist mocks
const mockNavigate = vi.fn();
const mockLocation = { search: '' };

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => mockLocation,
    };
});

// Mock SoundManager
vi.mock('../../utils/SoundManager', () => ({
    default: {
        init: vi.fn(),
        playMatch: vi.fn(),
        playMiss: vi.fn(),
        playGameOver: vi.fn(),
        playLevelUp: vi.fn(),
    }
}));

// Mock lucide-react to prevent icon issues
vi.mock('lucide-react', () => ({
    Mic: () => <div data-testid="icon-mic" />,
    Volume2: () => <div data-testid="icon-volume" />,
    Ghost: () => <div data-testid="icon-ghost" />,
    Swords: () => <div data-testid="icon-swords" />,
    Clock: () => <div data-testid="icon-clock" />,
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    ArrowLeft: () => <div data-testid="icon-arrow-left" />,
    Globe: () => <div data-testid="icon-globe" />,
    User: () => <div data-testid="icon-user" />,
    GraduationCap: () => <div data-testid="icon-graduation-cap" />,
    Rocket: () => <div data-testid="icon-rocket" />,
    Crown: () => <div data-testid="icon-crown" />,
}));

// Mock framer-motion to avoid visibility issues with opacity: 0
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        header: ({ children, ...props }) => <header {...props}>{children}</header>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

// Context Mocks
const mockVocabularyContext = {
    getPracticeQueue: vi.fn().mockReturnValue([]),
    updateWordProgress: vi.fn(),
    markWordSeen: vi.fn(),
    vocabulary: [
        { id: '1', french: 'chat', english: 'cat', category: 'animals', gender: 'm' },
        { id: '2', french: 'chien', english: 'dog', category: 'animals', gender: 'm' }
    ],
    getDueWords: vi.fn().mockReturnValue([]),
    getWeightedPracticeWords: vi.fn().mockReturnValue([]),
};

const mockProgressContext = {
    stats: { level: 1, xp: 0 },
    recordCategoryPerformance: vi.fn(),
    logWordAttempt: vi.fn(),
    addXP: vi.fn(),
    addCoins: vi.fn(),
    updateDailyStat: vi.fn(),
    incrementStat: vi.fn(),
    globalDifficulty: 50,
    difficultySettings: { learnerType: 'visual' },
    offlineAudio: false
};

const renderWithProviders = (component) => {
    return render(
        <BrowserRouter>
            <ProgressContext.Provider value={mockProgressContext}>
                <VocabularyContext.Provider value={mockVocabularyContext}>
                    {component}
                </VocabularyContext.Provider>
            </ProgressContext.Provider>
        </BrowserRouter>
    );
};

describe('FallingWordsGame', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLocation.search = '';

        // Mock performance.now to work with fake timers
        let now = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => now);

        // Mock requestAnimationFrame to pass timestamp and increment time
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            return setTimeout(() => {
                now += 16;
                cb(now);
            }, 16);
        });

        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => clearTimeout(id));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders game title and initial state', () => {
        renderWithProviders(<FallingWordsGame />);
        expect(screen.getByText('Falling Words')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Type the French translation...')).toBeInTheDocument();
    });

    test('spawns words over time', async () => {
        vi.useFakeTimers();
        renderWithProviders(<FallingWordsGame />);

        // Advance time to trigger spawn (INITIAL_SPAWN_INTERVAL is 2000ms)
        await act(async () => {
            vi.advanceTimersByTime(3000);
        });

        // Words are rendered from vocabulary
        // Since words are random, we check if *any* of the mock words appear
        // Note: The game renders the English translation
        const hasWord = screen.queryByText('cat') || screen.queryByText('dog');
        expect(hasWord).toBeInTheDocument();

        vi.useRealTimers();
    });

    test('handles user input correctly', async () => {
        vi.useFakeTimers();
        renderWithProviders(<FallingWordsGame />);

        // Wait for spawn
        await act(async () => {
            vi.advanceTimersByTime(3000);
        });

        // Find which word spawned
        const cat = screen.queryByText('cat');
        const dog = screen.queryByText('dog');
        const targetWord = cat ? 'chat' : 'chien';

        const input = screen.getByPlaceholderText('Type the French translation...');

        await act(async () => {
            fireEvent.change(input, { target: { value: targetWord } });
        });

        // Should call updateWordProgress
        expect(mockVocabularyContext.updateWordProgress).toHaveBeenCalledWith(
            expect.any(String),
            'good'
        );

        // Input should be cleared
        expect(input.value).toBe('');

        vi.useRealTimers();
    });

    test('game over when time runs out', async () => {
        vi.useFakeTimers();
        renderWithProviders(<FallingWordsGame />);

        // INITIAL_TIME_SECONDS = 90
        await act(async () => {
            vi.advanceTimersByTime(95000);
        });

        expect(screen.getByText("Time's Up!")).toBeInTheDocument();

        vi.useRealTimers();
    });
});
