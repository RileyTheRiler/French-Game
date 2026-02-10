import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LessonCreator from './LessonCreator';
import { useProgress } from '../context/ProgressContext';
import { BrowserRouter } from 'react-router-dom';

// Mock ProgressContext hook
vi.mock('../context/ProgressContext', () => ({
  useProgress: vi.fn(),
}));

// Mock SoundManager
vi.mock('../utils/SoundManager', () => ({
  default: {
    playPop: vi.fn(),
    playFlip: vi.fn(),
    playSuccess: vi.fn(),
    playMatch: vi.fn(),
    playMiss: vi.fn(),
  },
}));

// Mock audio
vi.mock('../utils/audio', () => ({
  speak: vi.fn(),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="icon-plus" />,
  Save: () => <span data-testid="icon-save" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Edit3: () => <span data-testid="icon-edit" />,
  Share2: () => <span data-testid="icon-share" />,
  Book: () => <span data-testid="icon-book" />,
  List: () => <span data-testid="icon-list" />,
  CheckSquare: () => <span data-testid="icon-check" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  X: () => <span data-testid="icon-x" />,
  Play: () => <span data-testid="icon-play" />,
  Volume2: () => <span data-testid="icon-volume" />,
  Globe: () => <span data-testid="icon-globe" />,
  User: () => <span data-testid="icon-user" />,
  GraduationCap: () => <span data-testid="icon-graduation-cap" />,
  Rocket: () => <span data-testid="icon-rocket" />,
  Crown: () => <span data-testid="icon-crown" />,
}));

// Mock GameLayout to avoid issues with its dependencies
vi.mock('./layout/GameLayout', () => ({
  GameLayout: ({ children, title }) => (
    <div data-testid="game-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

const renderWithContext = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('LessonCreator', () => {
  const mockUpdateStats = vi.fn();
  const mockAddXP = vi.fn();

  beforeEach(() => {
    useProgress.mockReturnValue({
      stats: { userLessonsCreated: 0 },
      updateStats: mockUpdateStats,
      addXP: mockAddXP,
      globalDifficulty: 50,
    });
  });

  it('renders correctly', () => {
    renderWithContext(<LessonCreator />);
    expect(screen.getByText('Lesson Creator')).toBeInTheDocument();
  });

  it('has accessible buttons for lessons', async () => {
      // Create a dummy lesson in localStorage to render the list
      const dummyLesson = {
          id: '123',
          title: 'Test Lesson',
          type: 'deck',
          content: [{id: '1', french: 'oui', english: 'yes'}]
      };

      // We need to set localStorage before rendering
      // But since useState initializer runs only once, we need to mock localStorage.getItem
      // However, we can just set it before the component mounts if we are in a fresh test environment.
      // Or we can rely on the component reading from localStorage on mount.

      // Let's manually set localStorage and then render
      localStorage.setItem('frenchApp_userLessons', JSON.stringify([dummyLesson]));

      renderWithContext(<LessonCreator />);

      // Wait for the lesson to appear
      await waitFor(() => {
          expect(screen.getByText('Test Lesson')).toBeInTheDocument();
      });

      // These assertions are expected to FAIL initially
      // We are looking for buttons with specific accessible names
      expect(screen.getByRole('button', { name: /delete lesson/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit lesson/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start lesson/i })).toBeInTheDocument();
  });
});
