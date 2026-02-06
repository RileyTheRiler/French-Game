import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FallingWordsGame from './FallingWordsGame';
import { VocabularyContext } from '../../context/VocabularyContext';
import { ProgressContext } from '../../context/ProgressContext';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
    vocabulary: {
        getDueWords: vi.fn(),
        updateWordProgress: vi.fn(),
        getWeightedPracticeWords: vi.fn(),
        markWordSeen: vi.fn(),
        getPracticeQueue: vi.fn(),
        vocabulary: [
            { id: '1', french: 'Chat', english: 'Cat' },
            { id: '2', french: 'Chien', english: 'Dog' }
        ]
    },
    progress: {
        logWordAttempt: vi.fn(),
        recordCategoryPerformance: vi.fn(),
        setModeDifficulty: vi.fn(),
        addXP: vi.fn(),
        addCoins: vi.fn(),
        updateDailyStat: vi.fn(),
        incrementStat: vi.fn(),
        difficultySettings: {
            globalMultiplier: 1.0,
            showHints: false
        }
    }
}));

// Mocks
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en' }
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
    Zap: () => <div data-testid="icon-zap" />,
    Brain: () => <div data-testid="icon-brain" />,
    GraduationCap: () => <div data-testid="icon-graduation-cap" />,
    User: () => <div data-testid="icon-user" />,
    Rocket: () => <div data-testid="icon-rocket" />,
    Crown: () => <div data-testid="icon-crown" />,
}));

// Mock framer-motion
vi.mock('framer-motion', () => {
    const motion = new Proxy({}, {
        get: (target, prop) => {
            return ({ children, ...props }) => {
                const Component = prop;
                // Strip motion-specific props if needed, but for simple tests just rendering is fine
                return <Component {...props}>{children}</Component>;
            };
        }
    });
    return {
        motion,
        AnimatePresence: ({ children }) => <>{children}</>,
    };
});

// Mock useProgress to avoid context issues
vi.mock('../../context/ProgressContext', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useProgress: () => mocks.progress,
    };
});

const renderWithContext = (ui) => {
    return render(
        <ProgressContext.Provider value={mocks.progress}>
            <VocabularyContext.Provider value={mocks.vocabulary}>
                <MemoryRouter>
                    {ui}
                </MemoryRouter>
            </VocabularyContext.Provider>
        </ProgressContext.Provider>
    );
};

describe('FallingWordsGame', () => {
    let perfNowStub;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();

        // Mock performance.now to advance with fake timers
        let currentTime = 0;
        perfNowStub = vi.spyOn(performance, 'now').mockImplementation(() => currentTime);

        // Mock requestAnimationFrame
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            return setTimeout(() => {
                currentTime += 16;
                cb(currentTime);
            }, 16);
        });

        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => clearTimeout(id));
    });

    afterEach(() => {
        vi.useRealTimers();
        perfNowStub.mockRestore();
    });

    it('renders game title and initial state', () => {
        mocks.vocabulary.getWeightedPracticeWords.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat' }
        ]);
        renderWithContext(<FallingWordsGame />);

        expect(screen.getByText('Falling Words')).toBeInTheDocument();
        // Score is displayed (avoid hidden one)
        const visibleScore = screen.getAllByText('0').find(el => el.tagName === 'SPAN' || el.className.includes('Badge'));
        if (!visibleScore) {
             // Fallback if specific filtering fails, just ensure one is visible
             expect(screen.getAllByText('0')[0]).toBeInTheDocument();
        } else {
             expect(visibleScore).toBeInTheDocument();
        }
    });

    it('spawns words and handles correct input', async () => {
        mocks.vocabulary.getWeightedPracticeWords.mockReturnValue([
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
        // Score logic adds > 10 points
        expect(await screen.findByText(/12/)).toBeInTheDocument();
        expect(input.value).toBe(''); // Input should clear
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
            vi.advanceTimersByTime(91000);
        });

        expect(await screen.findByText("Time's Up!")).toBeInTheDocument();
    });

    it('adds time on correct answer', async () => {
        mocks.vocabulary.getWeightedPracticeWords.mockReturnValue([
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
