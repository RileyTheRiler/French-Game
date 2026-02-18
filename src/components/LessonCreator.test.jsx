import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import LessonCreator from './LessonCreator';
import * as ProgressContextModule from '../context/ProgressContext';

// Mock dependencies
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock('../utils/SoundManager', () => ({
    default: {
        playPop: vi.fn(),
        playMatch: vi.fn(),
        playMiss: vi.fn(),
        playSuccess: vi.fn(),
        playFlip: vi.fn(),
    },
}));

vi.mock('../utils/audio', () => ({
    speak: vi.fn(),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Plus: () => <span data-testid="icon-plus" />,
    Save: () => <span data-testid="icon-save" />,
    Trash2: () => <span data-testid="icon-trash2" />,
    Edit3: () => <span data-testid="icon-edit3" />,
    Share2: () => <span data-testid="icon-share2" />,
    Book: () => <span data-testid="icon-book" />,
    List: () => <span data-testid="icon-list" />,
    CheckSquare: () => <span data-testid="icon-check-square" />,
    Sparkles: () => <span data-testid="icon-sparkles" />,
    ChevronRight: () => <span data-testid="icon-chevron-right" />,
    X: () => <span data-testid="icon-x" />,
    Play: () => <span data-testid="icon-play" />,
    Volume2: () => <span data-testid="icon-volume2" />,
    Globe: () => <span data-testid="icon-globe" />,
    User: () => <span data-testid="icon-user" />,
    GraduationCap: () => <span data-testid="icon-graduation-cap" />,
    Rocket: () => <span data-testid="icon-rocket" />,
    Crown: () => <span data-testid="icon-crown" />,
}));

// Mock GameLayout
vi.mock('./layout/GameLayout', () => ({
    GameLayout: ({ children, title }) => (
        <div data-testid="game-layout">
            <h1>{title}</h1>
            {children}
        </div>
    ),
}));

vi.mock('./ui/Badge', () => ({
    Badge: ({ children }) => <span data-testid="badge">{children}</span>,
}));

vi.mock('./ui/Button', () => ({
    Button: ({ children, onClick, 'aria-label': ariaLabel, ...props }) => (
        <button onClick={onClick} aria-label={ariaLabel} {...props}>
            {children}
        </button>
    ),
}));

vi.mock('./ui/Card', () => ({
    Card: ({ children, onClick }) => (
        <div onClick={onClick} data-testid="card">
            {children}
        </div>
    ),
}));

// Mock useProgress hook
vi.mock('../context/ProgressContext', () => ({
    useProgress: vi.fn(),
}));

describe('LessonCreator', () => {
    const mockUpdateStats = vi.fn();
    const mockAddXP = vi.fn();
    const defaultContext = {
        stats: { userLessonsCreated: 0 },
        updateStats: mockUpdateStats,
        addXP: mockAddXP,
        globalDifficulty: 1,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Setup default mock return value
        vi.mocked(ProgressContextModule.useProgress).mockReturnValue(defaultContext);
    });

    it('renders the initial list view', () => {
        render(<LessonCreator />);
        expect(screen.getByText('Lesson Creator')).toBeInTheDocument();
        expect(screen.getByText('Create Flashcard Deck')).toBeInTheDocument();
        expect(screen.getByText('Create Custom Quiz')).toBeInTheDocument();
    });

    it('navigates to create deck mode and checks for accessibility labels', () => {
        render(<LessonCreator />);
        fireEvent.click(screen.getByText('Create Flashcard Deck'));

        // Check for inputs with aria-labels
        expect(screen.getByLabelText('Lesson Title')).toBeInTheDocument();
        expect(screen.getByLabelText('French word')).toBeInTheDocument();
        expect(screen.getByLabelText('English translation')).toBeInTheDocument();
    });

    it('navigates to create quiz mode and checks for accessibility labels', () => {
        render(<LessonCreator />);
        fireEvent.click(screen.getByText('Create Custom Quiz'));

        // Check for inputs with aria-labels
        expect(screen.getByLabelText('Quiz Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Question')).toBeInTheDocument();
        expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
        expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
        expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
        expect(screen.getByLabelText('Option 4')).toBeInTheDocument();
    });

    it('displays user created lessons with accessible buttons', () => {
        const mockLessons = [
            {
                id: '1',
                title: 'My First Lesson',
                type: 'deck',
                content: [{ id: 'w1', french: 'Chat', english: 'Cat' }]
            }
        ];
        localStorage.setItem('frenchApp_userLessons', JSON.stringify(mockLessons));

        render(<LessonCreator />);

        expect(screen.getByText('My First Lesson')).toBeInTheDocument();

        // Check for accessible buttons
        expect(screen.getByLabelText('Delete lesson')).toBeInTheDocument();
        expect(screen.getByLabelText('Edit lesson')).toBeInTheDocument();
        expect(screen.getByLabelText('Start lesson')).toBeInTheDocument();
    });

    it('checks aria-pressed on correct answer button in quiz mode', () => {
        render(<LessonCreator />);
        fireEvent.click(screen.getByText('Create Custom Quiz'));

        const optionInput = screen.getByLabelText('Option 1');
        fireEvent.change(optionInput, { target: { value: 'Answer A' } });

        const correctButtons = screen.getAllByText('Correct');
        const firstCorrectButton = correctButtons[0];
        // Before clicking, it should not be pressed (or aria-pressed should be false)
        expect(firstCorrectButton).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(firstCorrectButton);

        // After clicking, it should be pressed (true) because the option value matches correct answer
        expect(firstCorrectButton).toHaveAttribute('aria-pressed', 'true');
    });
});
