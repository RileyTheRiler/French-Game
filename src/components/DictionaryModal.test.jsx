import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DictionaryModal from './DictionaryModal';
import * as VocabularyContextModule from '../context/VocabularyContext';
import * as ProgressContextModule from '../context/ProgressContext';

// Mock child components/icons to simplify testing
vi.mock('lucide-react', () => ({
  Star: () => <span data-testid="icon-star">Star</span>,
  Pin: () => <span data-testid="icon-pin">Pin</span>,
  Clock3: () => <span data-testid="icon-clock">Clock</span>,
  BellOff: () => <span data-testid="icon-bell-off">BellOff</span>,
  Volume2: () => <span data-testid="icon-volume">Volume</span>,
}));

// Mock audio utility
vi.mock('../utils/audio', () => ({
  playWordAudio: vi.fn(),
}));

// Mock hooks
vi.mock('../context/VocabularyContext', () => ({
  useVocabulary: vi.fn(),
}));

vi.mock('../context/ProgressContext', () => ({
  useProgress: vi.fn(),
}));

describe('DictionaryModal Accessibility', () => {
  const mockVocabularyContext = {
    vocabulary: [
      { id: 1, french: 'Bonjour', english: 'Hello', level: 1, isSaved: false, pinned: false, lastSeen: Date.now() }
    ],
    toggleSaveWord: vi.fn(),
    togglePinWord: vi.fn(),
    snoozeWord: vi.fn(),
    clearSnooze: vi.fn(),
  };

  const mockProgressContext = {
    offlineAudio: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock implementations
    vi.mocked(VocabularyContextModule.useVocabulary).mockReturnValue(mockVocabularyContext);
    vi.mocked(ProgressContextModule.useProgress).mockReturnValue(mockProgressContext);
  });

  it('has accessible modal structure', () => {
    render(<DictionaryModal onClose={() => {}} />);

    // These assertions are expected to fail initially
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dictionary-title');

    const title = screen.getByText('Resources');
    expect(title).toHaveAttribute('id', 'dictionary-title');
  });

  it('has accessible close button', () => {
    render(<DictionaryModal onClose={() => {}} />);
    const closeButton = screen.getByLabelText('Close dictionary');
    expect(closeButton).toBeInTheDocument();
  });

  it('has accessible tabs', () => {
    render(<DictionaryModal onClose={() => {}} />);

    const tabList = screen.getByRole('tablist');
    expect(tabList).toBeInTheDocument();
    expect(tabList).toHaveAttribute('aria-label', 'Resource categories');

    const vocabTab = screen.getByRole('tab', { name: 'Dictionary' });
    const savedTab = screen.getByRole('tab', { name: 'Saved' });
    const grammarTab = screen.getByRole('tab', { name: 'Grammar' });

    expect(vocabTab).toHaveAttribute('aria-selected', 'true');
    expect(savedTab).toHaveAttribute('aria-selected', 'false');
    expect(grammarTab).toHaveAttribute('aria-selected', 'false');

    expect(vocabTab).toHaveAttribute('aria-controls', 'dictionary-content-panel');
  });

  it('has accessible audio button', () => {
    render(<DictionaryModal onClose={() => {}} />);
    const audioButton = screen.getByLabelText('Play pronunciation for Bonjour');
    expect(audioButton).toBeInTheDocument();
  });

  it('has accessible search input', () => {
    render(<DictionaryModal onClose={() => {}} />);
    const searchInput = screen.getByPlaceholderText('Search dictionary...');
    expect(searchInput).toHaveAttribute('aria-label', 'Search dictionary');
  });
});
