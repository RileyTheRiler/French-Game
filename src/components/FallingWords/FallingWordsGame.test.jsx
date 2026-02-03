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

vi.mock('framer-motion', () => ({
    motion: {
        // Filter out framer-specific props to avoid React warnings
        div: ({ children, whileHover, whileTap, initial, animate, exit, transition, variants, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, whileHover, whileTap, initial, animate, exit, transition, variants, ...props }) => <button {...props}>{children}</button>,
        header: ({ children, whileHover, whileTap, initial, animate, exit, transition, variants, ...props }) => <header {...props}>{children}</header>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en' },
    }),
}));

vi.mock('../LanguageSwitcher', () => ({
    default: () => <div data-testid="language-switcher" />
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
    Brain: () => <div data-testid="icon-brain" />,
    Skull: () => <div data-testid="icon-skull" />,
    Flame: () => <div data-testid="icon-flame" />,
}));

const mockVocabulary = {
    getDueWords: vi.fn(),
    updateWordProgress: vi.fn(),
    getWeightedPracticeWords: vi.fn(),
    markWordSeen: vi.fn(),
    vocabulary: [
        { id: '1', french: 'Chat', english: 'Cat' },
        { id: '2', french: 'Chien', english: 'Dog' }
    ]
};

const mockProgress = {
    logWordAttempt: vi.fn(),
    addXP: vi.fn(),
    updateDailyStat: vi.fn(),
    globalDifficulty: 25,
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

        let now = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => now);

        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            return setTimeout(() => {
                now += 100;
                cb(now);
            }, 100);
        });

        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => clearTimeout(id));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders game title and initial state', () => {
        mockVocabulary.getWeightedPracticeWords.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat' }
        ]);
        mockVocabulary.getDueWords.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat' }
        ]);

        renderWithContext(<FallingWordsGame />);

        expect(screen.getByText('Falling Words')).toBeInTheDocument();
        expect(screen.getByText('0', { selector: '.hidden' })).toBeInTheDocument();
    });

    it.skip('spawns words and handles correct input', async () => {
        mockVocabulary.getDueWords.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat', translation: 'Cat', category: 'Animals' }
        ]);

        renderWithContext(<FallingWordsGame />);

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(await screen.findByText('Cat')).toBeInTheDocument();

        const input = screen.getByPlaceholderText(/Type the French translation/i);
        fireEvent.change(input, { target: { value: 'Chat' } });

        expect(input.value).toBe('');
        expect(mockVocabulary.updateWordProgress).toHaveBeenCalled();
    }, 15000);

    it('shows timer in default mode', () => {
        mockVocabulary.getDueWords.mockReturnValue([]);
        renderWithContext(<FallingWordsGame />);
        expect(screen.getByText('1:30')).toBeInTheDocument();
    });

    it.skip('ends game when time runs out', async () => {
        mockVocabulary.getDueWords.mockReturnValue([]);
        renderWithContext(<FallingWordsGame />);

        act(() => {
            vi.advanceTimersByTime(95000);
        });

        expect(await screen.findByText("Time's Up!")).toBeInTheDocument();
    }, 15000);
});
