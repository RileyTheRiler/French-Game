import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FallingWordsGame from './FallingWordsGame';
import { VocabularyContext } from '../../context/VocabularyContext';
import { ProgressContext } from '../../context/ProgressContext';
import { MemoryRouter } from 'react-router-dom';

// Mocks
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: {
            language: 'en',
            changeLanguage: vi.fn(),
        },
    }),
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

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
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
    Mic: () => <div data-testid="icon-mic" />,
    Clock: () => <div data-testid="icon-clock" />,
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    Globe: () => <div data-testid="icon-globe" />,
    Brain: () => <div data-testid="icon-brain" />,
    Zap: () => <div data-testid="icon-zap" />,
    Trophy: () => <div data-testid="icon-trophy" />,
    Flame: () => <div data-testid="icon-flame" />,
    User: () => <div data-testid="icon-user" />,
    GraduationCap: () => <div data-testid="icon-graduation-cap" />,
    Rocket: () => <div data-testid="icon-rocket" />,
    Crown: () => <div data-testid="icon-crown" />,
}));

// Mock UI components
vi.mock('../layout/GameLayout', () => ({
    GameLayout: ({ children, title, headerRight }) => (
        <div data-testid="game-layout">
            <h1>{title}</h1>
            <div data-testid="header-right">{headerRight}</div>
            {children}
        </div>
    )
}));

vi.mock('../ui/Badge', () => ({
    Badge: ({ children, variant, className }) => (
        <div data-testid="badge" className={`${variant} ${className}`}>
            {children}
        </div>
    )
}));

vi.mock('../ui/Card', () => ({
    Card: ({ children, className }) => (
        <div data-testid="card" className={className}>
            {children}
        </div>
    )
}));

vi.mock('../ui/Button', () => ({
    Button: ({ children, onClick, disabled }) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    )
}));

vi.mock('../ui/DifficultySlider', () => ({
    default: ({ value, onChange }) => (
        <input
            type="range"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            data-testid="difficulty-slider"
        />
    )
}));

const mockVocabulary = {
    getDueWords: vi.fn().mockReturnValue([]),
    updateWordProgress: vi.fn(),
    getWeightedPracticeWords: vi.fn().mockReturnValue([]),
    getPracticeQueue: vi.fn().mockReturnValue([]),
    vocabulary: [
        { id: '1', french: 'Chat', english: 'Cat' },
        { id: '2', french: 'Chien', english: 'Dog' }
    ],
    markWordSeen: vi.fn(),
    CATEGORIES: {}
};

const mockProgress = {
    logWordAttempt: vi.fn(),
    setModeDifficulty: vi.fn(),
    recordCategoryPerformance: vi.fn(),
    addXP: vi.fn(),
    addCoins: vi.fn(),
    updateDailyStat: vi.fn(),
    incrementStat: vi.fn(),
    offlineAudio: false,
    globalDifficulty: 50,
    difficultySettings: {
        fallingWords: 3,
        globalMultiplier: 1.0,
        showHints: false,
        learnerType: 'visual'
    },
    categoryPerformance: {}
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
    let rafCallback = null;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();

        currentTime = 0;
        rafCallback = null;

        vi.spyOn(performance, 'now').mockImplementation(() => currentTime);

        // Synchronous RAF mock
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            rafCallback = cb;
            return 123;
        });

        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => {
            // No-op
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    // Helper to advance game loop
    const runGameLoop = async (frames) => {
        await act(async () => {
            for (let i = 0; i < frames; i++) {
                if (rafCallback) {
                    currentTime += 16;
                    rafCallback(currentTime);
                } else {
                    break;
                }
            }
        });
    };

    it('renders game title and initial state', () => {
        mockVocabulary.getWeightedPracticeWords.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat' }
        ]);
        renderWithContext(<FallingWordsGame />);

        expect(screen.getByText('Falling Words')).toBeInTheDocument();
        const scoreElements = screen.getAllByText('0');
        expect(scoreElements.length).toBeGreaterThan(0);
    });

    it('spawns words and handles correct input', async () => {
        mockVocabulary.getWeightedPracticeWords.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', translation: 'Cat' }
        ]);

        renderWithContext(<FallingWordsGame />);

        // Advance frames to spawn (2000ms / 16ms = 125 frames)
        await runGameLoop(200);

        expect(screen.getByText('Cat')).toBeInTheDocument();

        // Type the correct answer "Chat"
        const input = screen.getByPlaceholderText(/Type the French translation/i);
        fireEvent.change(input, { target: { value: 'Chat' } });

        // Score should update - input clearing is a side effect of match
        expect(input.value).toBe('');
    });

    it('shows timer in default mode', () => {
        renderWithContext(<FallingWordsGame />);
        expect(screen.getByText('1:30')).toBeInTheDocument();
    });

    it('ends game when time runs out', async () => {
        renderWithContext(<FallingWordsGame />);

        // Advance past 90 seconds (90000ms / 16ms = ~5625 frames)
        await runGameLoop(6000);

        // Check for Game Over text
        expect(screen.getByText("Time's Up!")).toBeInTheDocument();
    });

    it('adds time on correct answer', async () => {
        mockVocabulary.getWeightedPracticeWords.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', translation: 'Cat' }
        ]);

        renderWithContext(<FallingWordsGame />);

        // Spawn word
        await runGameLoop(200);

        // Answer correctly
        const input = screen.getByPlaceholderText(/Type the French translation/i);
        fireEvent.change(input, { target: { value: 'Chat' } });

        // Verify time added popup
        expect(screen.getByText('+5s')).toBeInTheDocument();
    });
});
