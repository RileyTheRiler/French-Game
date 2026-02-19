import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DictionaryModal from './DictionaryModal';

// Mock dependencies
vi.mock('../context/VocabularyContext', () => ({
  useVocabulary: () => ({
    vocabulary: [],
    toggleSaveWord: vi.fn(),
    togglePinWord: vi.fn(),
    snoozeWord: vi.fn(),
    clearSnooze: vi.fn(),
  }),
}));

vi.mock('../context/ProgressContext', () => ({
  useProgress: () => ({
    offlineAudio: false,
  }),
}));

// Mock lucide-react icons to avoid rendering issues
vi.mock('lucide-react', () => ({
  Star: () => <span data-testid="icon-star" />,
  Pin: () => <span data-testid="icon-pin" />,
  Clock3: () => <span data-testid="icon-clock" />,
  BellOff: () => <span data-testid="icon-bell-off" />,
  Volume2: () => <span data-testid="icon-volume" />,
}));

// Mock grammar data since it's imported directly
vi.mock('../data/grammar', () => ({
  GRAMMAR_TIPS: [],
}));

describe('DictionaryModal Accessibility', () => {
  it('should have a tablist with accessible tabs', () => {
    render(<DictionaryModal onClose={() => {}} />);

    // Check for tablist role
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    expect(tabs[0]).toHaveTextContent('Dictionary');
    expect(tabs[1]).toHaveTextContent('Saved');
    expect(tabs[2]).toHaveTextContent('Grammar');

    // Check aria-selected
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('should have an accessible close button', () => {
      render(<DictionaryModal onClose={() => {}} />);
      // We look for a button with an accessible name 'Close'
      // This might find multiple if not careful, but the close button is distinct
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
  });
});
