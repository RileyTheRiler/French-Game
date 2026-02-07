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

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: key => key,
        i18n: { language: 'en' }
    }),
    initReactI18next: {
        type: '3rdParty',
        init: () => {}
    }
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
    GraduationCap: () => <div data-testid="icon-grad-cap" />,
    Rocket: () => <div data-testid="icon-rocket" />,
    Crown: () => <div data-testid="icon-crown" />,
    Mic: () => <div data-testid="icon-mic" />,
    Clock: () => <div data-testid="icon-clock" />,
    TrendingUp: () => <div data-testid="icon-trending-up" />,
}));

const mockVocabulary = {
    getDueWords: vi.fn(),
    updateWordProgress: vi.fn(),
    getWeightedPracticeWords: vi.fn(),
    markWordSeen: vi.fn(),
    vocabulary: [
        { id: '1', french: 'Chat', english: 'Cat' },
        { id: '2', french: 'Chien', english: 'Dog' }
    ],
    getPracticeQueue: vi.fn(() => [
        { id: '1', french: 'Chat', english: 'Cat' }
    ])
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
    },
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
        let lastTime = 0;
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            return setTimeout(() => {
                lastTime += 16;
                cb(performance.now() + lastTime);
            }, 16);
        });
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => clearTimeout(id));

        // Setup default mocks
        mockVocabulary.getWeightedPracticeWords.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat' }
        ]);
        mockVocabulary.getPracticeQueue.mockReturnValue([
            { id: '1', french: 'Chat', english: 'Cat' }
        ]);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders game title and initial state', () => {
        renderWithContext(<FallingWordsGame />);

        expect(screen.getByText('Falling Words')).toBeInTheDocument();
        expect(screen.getByTestId('icon-trending-up')).toBeInTheDocument();
    });

    it('shows timer in default mode', () => {
        renderWithContext(<FallingWordsGame />);
        expect(screen.getByText('1:30')).toBeInTheDocument();
    });
});
