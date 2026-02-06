import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DictionaryModal from './DictionaryModal';
import { VocabularyProvider } from '../context/VocabularyContext';
import { ProgressProvider } from '../context/ProgressContext';

// Mock contexts
const mockVocabulary = [
  { id: '1', french: 'Bonjour', english: 'Hello', isSaved: false, pinned: false, level: 1 },
  { id: '2', french: 'Chat', english: 'Cat', isSaved: true, pinned: true, level: 3 },
];

const mockToggleSaveWord = vi.fn();
const mockTogglePinWord = vi.fn();
const mockSnoozeWord = vi.fn();
const mockClearSnooze = vi.fn();

vi.mock('../context/VocabularyContext', () => ({
  useVocabulary: () => ({
    vocabulary: mockVocabulary,
    toggleSaveWord: mockToggleSaveWord,
    togglePinWord: mockTogglePinWord,
    snoozeWord: mockSnoozeWord,
    clearSnooze: mockClearSnooze,
  }),
}));

vi.mock('../context/ProgressContext', () => ({
  useProgress: () => ({
    offlineAudio: false,
  }),
}));

vi.mock('../utils/audio', () => ({
  playWordAudio: vi.fn(),
}));

describe('DictionaryModal Accessibility', () => {
  it('renders correctly', () => {
    render(<DictionaryModal onClose={() => {}} />);
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search dictionary...')).toBeInTheDocument();
  });

  it('has accessible close button', () => {
    render(<DictionaryModal onClose={() => {}} />);
    // This is what we expect to fail initially or succeed if I fix it
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('has accessible tabs', () => {
    render(<DictionaryModal onClose={() => {}} />);
    const tabList = screen.getByRole('tablist');
    expect(tabList).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    expect(tabs[0]).toHaveAttribute('aria-selected', 'true'); // Dictionary
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false'); // Saved
  });

  it('has accessible search input', () => {
    render(<DictionaryModal onClose={() => {}} />);
    const searchInput = screen.getByPlaceholderText('Search dictionary...');
    expect(searchInput).toHaveAttribute('aria-label', 'Search dictionary');
  });
});
